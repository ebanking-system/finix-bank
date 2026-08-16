package com.finix.kyc.service;

import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finix.common.exception.AccessDeniedException;
import com.finix.auth.service.AuditLogService;
import com.finix.util.FileStorageUtil;
import com.finix.kyc.dto.KycUploadRequest;
import com.finix.account.entity.Account;
import com.finix.account.entity.AccountStatus;
import com.finix.account.entity.AccountType;
import com.finix.account.repository.AccountRepository;
import com.finix.account.service.AccountServiceImpl;
import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.JwtDTO;
import com.finix.auth.entity.Role;
import com.finix.customer.entity.Customer;
import com.finix.customer.repository.CustomerRepository;
import com.finix.employee.entity.Designation;
import com.finix.employee.entity.Employee;
import com.finix.employee.repository.EmployeeRepository;
import com.finix.kyc.dto.KycDocumentDto;
import com.finix.kyc.dto.KycDocumentDto2;
import com.finix.kyc.dto.KycDocumentDto3;
import com.finix.kyc.dto.StatusDto;
import com.finix.kyc.entity.KycDocuments;
import com.finix.kyc.entity.Status;
import com.finix.kyc.repository.KycDocumentRepository;
import com.finix.notification.dto.NotificationEvent;
import com.finix.notification.producer.NotificationProducer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class KycServiceImpl implements KycService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
	private final KycDocumentRepository kycDocumentRepository;
	private final AccountServiceImpl accountServiceImpl;
	private final EmployeeRepository employeeRepository;
	private final FileStorageUtil fileStorageUtil;
	private final ModelMapper mapper;
	private final NotificationProducer notificationProducer;
	private final AuditLogService auditLogService;

	@Override
	public ResponseEntity<ApiResponse> updateKyc(KycDocumentDto2 request) {
	    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	    JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
	    Long customerId = jwt.getUserId();

	    Customer customer = customerRepository.findById(customerId)
	            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
	    KycDocuments kyc = kycDocumentRepository.findByCustomer(customer);

	    if (kyc == null) {
	        kyc = new KycDocuments();
	        kyc.setCustomer(customer);
	    }

	    if (request.getAadharNum() != null && !request.getAadharNum().isBlank()) {
	        kyc.setAadharNum(request.getAadharNum());
	    }

	    if (request.getPanNum() != null && !request.getPanNum().isBlank()) {
	        kyc.setPanNum(request.getPanNum());
	    }

	    // Since documents changed, KYC should be verified again
	    kyc.setStatus(Status.PENDING);
	    kycDocumentRepository.save(kyc);

	    return ResponseEntity.ok(new ApiResponse("success", "KYC Sent For Approval."));
	}

	@Override
	public ApiResponse updateStatus(Long id, StatusDto status) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		JwtDTO jwtDto = (JwtDTO) authentication.getPrincipal();

		boolean isManager = Role.MANAGER.name().equals(jwtDto.getRoleName());
		if (!isManager) {
			if (Role.CUSTOMER.name().equals(jwtDto.getRoleName())) {
				throw new AccessDeniedException("You are not authorized to update KYC status.");
			}

			Employee emp = employeeRepository.findById(jwtDto.getUserId())
					.orElseThrow(() -> new AccessDeniedException("Employee not found for user ID: " + jwtDto.getUserId()));
			if (!emp.getDesignation().equals(Designation.KYC_OFFICER)) {
				throw new AccessDeniedException("You are not authorized to perform KYC verification. Required: KYC_OFFICER or MANAGER");
			}
		}

		KycDocuments kycDocumentEntity = kycDocumentRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("KYC document not found with ID: " + id));

		if (status.getStatus() == Status.APPROVED) {
			kycDocumentEntity.setStatus(status.getStatus());
			Account account = accountRepository.findByAccountTypeAndCustomer(status.getAccountType(), kycDocumentEntity.getCustomer());
			if (account != null) {
				account.setStatus(AccountStatus.ACTIVE);
			}

			if (isManager) {
				auditLogService.logManagerOverride(
						jwtDto.getUserId(), "APPROVE_KYC", "KYC", id,
						"Manager approved KYC verification for customer #" + (kycDocumentEntity.getCustomer() != null ? kycDocumentEntity.getCustomer().getCustomerId() : "N/A")
				);
			}

			// Publish KYC approval notification to RabbitMQ
			try {
				if (kycDocumentEntity.getCustomer() != null && kycDocumentEntity.getCustomer().getUser() != null) {
					NotificationEvent event = NotificationEvent.builder()
							.customerId(kycDocumentEntity.getCustomer().getCustomerId())
							.eventType("KYC_APPROVED")
							.title("KYC Approved — Account Activated")
							.message("Your KYC verification has been approved. Your bank account is now ACTIVE and ready for transactions.")
							.email(kycDocumentEntity.getCustomer().getUser().getEmail())
							.channels(List.of("EMAIL", "IN_APP"))
							.build();
					notificationProducer.send(event);
				}
			} catch (Exception ex) {
				log.warn("Could not publish KYC approval notification: {}", ex.getMessage());
			}

			return new ApiResponse("success", "status update to APPROVED");			
		} else {
			kycDocumentEntity.setStatus(Status.REJECTED);

			if (isManager) {
				auditLogService.logManagerOverride(
						jwtDto.getUserId(), "REJECT_KYC", "KYC", id,
						"Manager rejected KYC verification for customer #" + (kycDocumentEntity.getCustomer() != null ? kycDocumentEntity.getCustomer().getCustomerId() : "N/A")
				);
			}

			// Publish KYC rejection notification to RabbitMQ
			try {
				if (kycDocumentEntity.getCustomer() != null && kycDocumentEntity.getCustomer().getUser() != null) {
					NotificationEvent event = NotificationEvent.builder()
							.customerId(kycDocumentEntity.getCustomer().getCustomerId())
							.eventType("KYC_REJECTED")
							.title("KYC Verification Update")
							.message("Your KYC documents were rejected. Please review and re-upload valid Aadhaar and PAN documents.")
							.email(kycDocumentEntity.getCustomer().getUser().getEmail())
							.channels(List.of("EMAIL", "IN_APP"))
							.build();
					notificationProducer.send(event);
				}
			} catch (Exception ex) {
				log.warn("Could not publish KYC rejection notification: {}", ex.getMessage());
			}

			return new ApiResponse("success", "status update to REJECTED");
		}
	}
	
	@Override
	public ResponseEntity<ApiResponse> uploadKyc(KycUploadRequest request) {
	    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	    JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
	    Long customerId = jwt.getUserId();

	    Customer customer = customerRepository.findById(customerId)
	            .orElseThrow(() -> new RuntimeException("Customer not found"));

	    KycDocuments kyc = kycDocumentRepository.findByCustomer(customer);
	    if (kyc == null) {
	        kyc = new KycDocuments();
	        kyc.setCustomer(customer);
	    }

	    String aadharPath = fileStorageUtil.saveFile(request.getAadharFile(), customerId);
	    String panPath = fileStorageUtil.saveFile(request.getPanFile(), customerId);
	    String selfiePath = fileStorageUtil.saveFile(request.getSelfie(), customerId);

	    kyc.setAadharFile(aadharPath);
	    kyc.setPanFile(panPath);
	    kyc.setSelfieFile(selfiePath);
	    kyc.setStatus(Status.PENDING);

	    kycDocumentRepository.save(kyc);

	    return ResponseEntity.ok(
	            new ApiResponse(
	                    "success",
	                    "KYC uploaded successfully."
	            )
	    );
	}

	@Override
	public ResponseEntity<?> getKycByStatus(Status status) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
		if (Role.CUSTOMER.name().equals(jwt.getRoleName())) {
			throw new AccessDeniedException("You are not authorized to view KYC list.");
		}

	    List<KycDocuments> kycDocumentEntity = kycDocumentRepository.findByStatus(status);
	    List<KycDocumentDto3> response = new ArrayList<>();

	    kycDocumentEntity.forEach(kyc -> {
	        KycDocumentDto3 dto = mapper.map(kyc, KycDocumentDto3.class);
	        if (kyc.getCustomer() != null) {
	            dto.setCustomerId(kyc.getCustomer().getCustomerId());
	        }
	        response.add(dto);
	    });

	    return ResponseEntity.ok(response);
	}

	@Override
	public ResponseEntity<?> getMyKyc() {
	    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	    JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
	    Long customerId = jwt.getUserId();

	    Customer customer = customerRepository.findById(customerId)
	            .orElseThrow(() -> new RuntimeException("Customer not found"));

	    KycDocuments kyc = kycDocumentRepository.findByCustomer(customer);
	    if (kyc == null) {
	        return ResponseEntity.ok(new KycDocumentDto3());
	    }

	    KycDocumentDto3 dto = mapper.map(kyc, KycDocumentDto3.class);
	    dto.setCustomerId(customerId);
	    return ResponseEntity.ok(dto);
	}

	@Override
	public ResponseEntity<?> getAllKyc() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
		if (Role.CUSTOMER.name().equals(jwt.getRoleName())) {
			throw new AccessDeniedException("You are not authorized to view KYC list.");
		}

	    List<KycDocuments> kycDocumentEntity = kycDocumentRepository.findAll();
	    List<KycDocumentDto3> response = new ArrayList<>();

	    kycDocumentEntity.forEach(kyc -> {
	        KycDocumentDto3 dto = mapper.map(kyc, KycDocumentDto3.class);
	        if (kyc.getCustomer() != null) {
	            dto.setCustomerId(kyc.getCustomer().getCustomerId());
	        }
	        response.add(dto);
	    });

	    return ResponseEntity.ok(response);
	}
}

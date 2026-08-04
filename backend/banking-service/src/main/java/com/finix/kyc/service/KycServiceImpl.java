package com.finix.kyc.service;

import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



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

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor

public class KycServiceImpl implements KycService{

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
	private final KycDocumentRepository kycDocumentRepository;
	private final AccountServiceImpl accountServiceImpl;
	private final EmployeeRepository employeeRepository;
	private final FileStorageUtil fileStorageUtil;
	private final ModelMapper mapper;

    
	@Override
	public ResponseEntity<ApiResponse> updateKyc(KycDocumentDto2 request) {
		

	    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

	    JwtDTO jwt = (JwtDTO) authentication.getPrincipal();

	    Long customerId = jwt.getUserId();

	    Customer customer = customerRepository.findById(customerId)
	            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
	    KycDocuments kyc = kycDocumentRepository.findByCustomer(customer);
	            

	    if (request.getAadharNum() != null && !request.getAadharNum().isBlank()) {
	        kyc.setAadharNum(request.getAadharNum());
	    }

	    if (request.getPanNum() != null && !request.getPanNum().isBlank()) {
	        kyc.setPanNum(request.getPanNum());
	    }

//	    if (request.getSelfImage() != null && !request.getSelfImage().isBlank()) {
//	        kyc.selfieFile(request.getSelfImage());
//	    }

	    // Since documents changed, KYC should be verified again
	    kyc.setStatus(Status.PENDING);

	    kycDocumentRepository.save(kyc);

	    return ResponseEntity.ok(new ApiResponse("success", "KYC Sent For Approval."));
	}
	@Override
	public ApiResponse updateStatus(Long id , StatusDto status) {
		// TODO Auto-generated method stub
		Authentication authentication=SecurityContextHolder.getContext().getAuthentication();
		JwtDTO jwtDto=(JwtDTO) authentication.getPrincipal();
		System.out.print("Role : "+jwtDto.getRoleName());
		if(jwtDto.getRoleName().equals(Role.CUSTOMER)) {
			
			return new ApiResponse("failure","ACCESS DENIED"); 
		}
		Employee emp=employeeRepository.findById(jwtDto.getUserId()).orElseThrow();
		System.out.print(emp);
		if(!emp.getDesignation().equals(Designation.KYC_OFFICER)) {
			return new ApiResponse("failure","ACCESS DENIED"); 
		}
		if(status.getStatus()==Status.APPROVED) {
			KycDocuments kycDocumentEntity=kycDocumentRepository.findById(id).orElseThrow();
			kycDocumentEntity.setStatus(status.getStatus());
//			Account account=	accountRepository.findByCustomerAndAccountType(kycDocumentEntity.getCustomer(),status.getAccountType());
			Account account=	accountRepository.findByAccountTypeAndCustomer(status.getAccountType(),kycDocumentEntity.getCustomer());

			account.setStatus(AccountStatus.ACTIVE);
			return new ApiResponse("success","status update to APPROVED");			
		}
		return new ApiResponse("success","status update to REJECTED");
	}
	
	@Override
	public ResponseEntity<ApiResponse> uploadKyc(KycUploadRequest request) {

	    // 1. Get logged-in customer
	    Authentication authentication =
	            SecurityContextHolder.getContext().getAuthentication();

	    JwtDTO jwt = (JwtDTO) authentication.getPrincipal();

	    Long customerId = jwt.getUserId();

	    // 2. Find customer
	    Customer customer = customerRepository.findById(customerId)
	            .orElseThrow(() ->
	                    new RuntimeException("Customer not found"));

	    // 3. Find KYC record
	    KycDocuments kyc = kycDocumentRepository.findByCustomer(customer);

	    if (kyc == null) {
	        kyc = new KycDocuments();
	        kyc.setCustomer(customer);
	    }

	    // 4. Update text fields
//	    kyc.setAadharNum(request.getAadharNum());
//	    kyc.setPanNum(request.getPanNum());

	    // 5. Save uploaded files

	    String aadharPath =
	            fileStorageUtil.saveFile(request.getAadharFile(), customerId);

	    String panPath =
	            fileStorageUtil.saveFile(request.getPanFile(), customerId);

	    String selfiePath =
	            fileStorageUtil.saveFile(request.getSelfie(), customerId);

	    // 6. Store file paths in database

	    kyc.setAadharFile(aadharPath);

	    kyc.setPanFile(panPath);

	    kyc.setSelfieFile(selfiePath);

	    // 7. KYC must be verified again

	    kyc.setStatus(Status.PENDING);

	    // 8. Save changes

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

	    List<KycDocuments> kycDocumentEntity = kycDocumentRepository.findByStatus(status);

	    List<KycDocumentDto3> response = new ArrayList<>();

	    kycDocumentEntity.forEach(kyc -> {

	        KycDocumentDto3 dto = mapper.map(kyc, KycDocumentDto3.class);

	        // Set customerId manually
	        if (kyc.getCustomer() != null) {
	            dto.setCustomerId(kyc.getCustomer().getCustomerId());
	        }

	        response.add(dto);
	    });

	    return ResponseEntity.ok(response);
	}
}

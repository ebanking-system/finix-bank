package com.finix.kyc.service;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
import com.finix.kyc.dto.KycDocumentDto2;
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

	    if (request.getSelfImage() != null && !request.getSelfImage().isBlank()) {
	        kyc.setSelfImage(request.getSelfImage());
	    }

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
}

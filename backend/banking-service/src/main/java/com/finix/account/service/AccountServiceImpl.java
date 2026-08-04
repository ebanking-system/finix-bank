package com.finix.account.service;

import com.finix.account.dto.AccountResponse;
import com.finix.account.dto.CreateAccountRequest;
import com.finix.account.entity.Account;
import com.finix.account.entity.AccountStatus;
import com.finix.account.entity.AccountType;
import com.finix.account.repository.AccountRepository;
import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.JwtDTO;
import com.finix.auth.entity.Role;
import com.finix.auth.entity.User;
import com.finix.auth.repository.UserRepository;
import com.finix.common.exception.AccessDeniedException;
import com.finix.customer.entity.Customer;
import com.finix.customer.repository.CustomerRepository;
import com.finix.kyc.entity.KycDocuments;
import com.finix.kyc.repository.KycDocumentRepository;
import com.finix.security.CustomUserDetailsImpl;

import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final KycDocumentRepository kycDocumentRepository;
    private final ModelMapper modelMapper;

    

    @Override
    public AccountResponse createAccount(AccountType accType , Customer customer) {
    	
//    	Authentication authentication =
//    	        SecurityContextHolder.getContext().getAuthentication();

//    	CustomUserDetailsImpl user =
//    	        (CustomUserDetailsImpl) authentication.getPrincipal();
    	
//    	JwtDTO jwt =
//        		(JwtDTO) authentication.getPrincipal();

//    	Long userId = jwt.getUserId();
    	
        // Check whether customer exists
//        Customer customer = customerRepository.findById(userId)
//                .orElseThrow(() ->
//                        new RuntimeException("Customer not found"));
        KycDocuments kycAccount=kycDocumentRepository.findByCustomer(customer);
        if(kycAccount==null) {
        	return null;
        }
        // Create Account object
        Account account = new Account();

        account.setCustomer(customer);
        account.setAccountType(accType);
        account.setBalance(BigDecimal.valueOf(0.0));

        // Generate Account Number
        account.setAccountNumber(generateAccountNumber());

        // Generate IFSC
        account.setIfscCode(generateIfscCode());

        // Default status
        account.setStatus(AccountStatus.CLOSED);

        // Save account
        System.out.print("Before Saved Account : "+account);
        
        Account savedAccount = accountRepository.save(account);
        // Convert Entity -> DTO
        AccountResponse response =
                modelMapper.map(savedAccount, AccountResponse.class);

//        response.setCustomerId(customer.getUser().getUserId());

        return response;
    }

    /**
     * Generates a unique 12 digit account number.
     */
    private String generateAccountNumber() {

        Random random = new Random();

        String accountNumber;

        do {

            long number = 100000000000L
                    + (Math.abs(random.nextLong()) % 900000000000L);

            accountNumber = String.valueOf(number);

        } while (accountRepository.existsByAccountNumber(accountNumber));

        return accountNumber;
    }

    /**
     * Generates IFSC code.
     * Currently project has only one branch.
     */
    private String generateIfscCode() {

        return "FINX0000001";
    }
    
    @Override
    public ApiResponse getAccountById(Long accountId) {

    	Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        JwtDTO jwtDTO = (JwtDTO) authentication.getPrincipal();

        Long loggedInUserId = jwtDTO.getUserId();

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() ->
                        new RuntimeException("Account not found"));
        System.out.print("Account : "+account);
        if(account.getAccountNumber().equals("0000000000000")) {
        	if(!jwtDTO.getRoleName().equals(Role.MANAGER)) {
        		System.out.println("failure You cant access this account");
        		return new ApiResponse("failure","You cant access this account");
        	}
        }

        Long ownerId = account.getCustomer()
                              .getUser()
                              .getUserId();

        if (!ownerId.equals(loggedInUserId)) {
        	System.out.println("You are not authorized to access this account.");
            throw new AccessDeniedException(
                    "You are not authorized to access this account.");
        }
        
        System.out.print(account);
        
        AccountResponse response =
                modelMapper.map(account, AccountResponse.class);

//        response.setCustomerId(account.getCustomer().getUser().getUserId());
        

        return new ApiResponse("success",response);
    }
    
    
    @Override
    public ApiResponse getAccountByNumber(String accountNumber) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        JwtDTO jwtDTO = (JwtDTO) authentication.getPrincipal();

        Long loggedInUserId = jwtDTO.getUserId();

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() ->
                        new RuntimeException("Account not found"));
        if(account.getAccountNumber().equals(0000000000000)) {
        	if(!jwtDTO.getRoleName().equals(Role.MANAGER)) {
        		return new ApiResponse("failure","You cant access this account");
        	}
        }

        Long ownerId = account.getCustomer()
                              .getUser()
                              .getUserId();

        if (!ownerId.equals(loggedInUserId)) {
            throw new AccessDeniedException(
                    "You are not authorized to access this account.");
        }

        return new ApiResponse("success", modelMapper.map(account, AccountResponse.class));
    }
    
    @Override
    public ApiResponse getAccountsByCustomer(Long customerId) {
    	Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        JwtDTO jwtDTO = (JwtDTO) authentication.getPrincipal();

        Long loggedInUserId = jwtDTO.getUserId();
        
        Customer loggedCustomer=customerRepository.findById(loggedInUserId).orElseThrow(() ->new RuntimeException("Customer not found"));
        

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));
        if(!customer.getCustomerId().equals(loggedCustomer.getCustomerId())) {
        	throw new AccessDeniedException(
                    "You are not authorized to access this account.");
        }

        List<Account> accounts =
                accountRepository.findByCustomer(customer);

        return new ApiResponse("success", accounts.stream()
                .map(account -> {

                    AccountResponse response =
                            modelMapper.map(account, AccountResponse.class);

//                    response.setCustomerId(customer.getUser().getUserId());

                    return response;

                })
                .collect(Collectors.toList()));
    }

	@Override
	public ResponseEntity<?> getBalance(AccountType accountType) {
		// TODO Auto-generated method stub
		Authentication authentication =
    	        SecurityContextHolder.getContext().getAuthentication();

//    	CustomUserDetailsImpl user =
//    	        (CustomUserDetailsImpl) authentication.getPrincipal();
		
		JwtDTO jwt =
        		(JwtDTO) authentication.getPrincipal();

    	Long userId = jwt.getUserId();
    	
    	Customer customer =customerRepository.findById(userId).orElseThrow();
    	
    	try {
    		BigDecimal balance=accountRepository.findByCustomerAndAccountType(customer,accountType).getBalance();    
    		return ResponseEntity.ok(balance);
    	}catch(Exception ex) {
    		return ResponseEntity.badRequest().body("ERROR :"+ex.getMessage());
    	}
    	
	}

}
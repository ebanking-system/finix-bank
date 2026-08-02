package com.finix.account.service;

import com.finix.account.dto.AccountResponse;
import com.finix.account.dto.CreateAccountRequest;
import com.finix.account.entity.Account;
import com.finix.account.entity.AccountStatus;
import com.finix.account.entity.AccountType;
import com.finix.account.repository.AccountRepository;
import com.finix.auth.dto.JwtDTO;
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
    public AccountResponse createAccount(AccountType accType) {
    	
    	Authentication authentication =
    	        SecurityContextHolder.getContext().getAuthentication();

//    	CustomUserDetailsImpl user =
//    	        (CustomUserDetailsImpl) authentication.getPrincipal();
    	
    	JwtDTO jwt =
        		(JwtDTO) authentication.getPrincipal();

    	Long userId = jwt.getUserId();
    	
        // Check whether customer exists
        Customer customer = customerRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));
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
        account.setStatus(AccountStatus.ACTIVE);

        // Save account
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
    public AccountResponse getAccountById(Long accountId) {

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() ->
                        new RuntimeException("Account not found"));

//        private Long accountId;
//
//        private String accountNumber;
//
//        private AccountType accountType;
//
//        private BigDecimal balance;
//
//        private String ifscCode;
//
//        private AccountStatus status;
//
//        private Long customerId;

//        private LocalDateTime createdDate;
//        AccountResponse resp=new AccountResponse();
//        resp.setAccountId(account.getAccountId());
//        resp.setAccountNumber(account.getAccountNumber());
//        resp.setAccountType(account.getAccountType());
//        resp.setBalance(account.getBalance());
//        resp.setIfscCode(account.getIfscCode());
//        resp.setStatus(account.getStatus());
//        resp.setCreatedDate(account.getCreatedDate());
        
        AccountResponse response =
                modelMapper.map(account, AccountResponse.class);

//        response.setCustomerId(account.getCustomer().getUser().getUserId());

        return response;
    }
    
    @Override
    public AccountResponse getAccountByNumber(String accountNumber) {

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() ->
                        new RuntimeException("Account not found"));

        AccountResponse response =
                modelMapper.map(account, AccountResponse.class);

//        response.setCustomerId(account.getCustomer().getUser().getUserId());

        return response;
    }
    
    @Override
    public List<AccountResponse> getAccountsByCustomer(Long customerId) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        List<Account> accounts =
                accountRepository.findByCustomer(customer);

        return accounts.stream()
                .map(account -> {

                    AccountResponse response =
                            modelMapper.map(account, AccountResponse.class);

//                    response.setCustomerId(customer.getUser().getUserId());

                    return response;

                })
                .collect(Collectors.toList());
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
package com.finix.account.service;

import com.finix.account.dto.AccountResponse;
import com.finix.account.dto.CreateAccountRequest;
import com.finix.account.dto.DepositRequestDTO;
import com.finix.account.dto.EmployeeDepositRequestDTO;
import com.finix.account.entity.Account;
import com.finix.account.entity.AccountStatus;
import com.finix.account.entity.AccountType;
import com.finix.account.repository.AccountRepository;
import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.JwtDTO;
import com.finix.auth.entity.Role;
import com.finix.common.exception.AccessDeniedException;
import com.finix.common.exception.BusinessException;
import com.finix.customer.entity.Customer;
import com.finix.customer.repository.CustomerRepository;
import com.finix.kyc.entity.KycDocuments;
import com.finix.kyc.entity.Status;
import com.finix.kyc.repository.KycDocumentRepository;
import com.finix.transaction.entity.Transaction;
import com.finix.transaction.entity.TransactionStatus;
import com.finix.transaction.entity.TransactionType;
import com.finix.transaction.repository.TransactionRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final KycDocumentRepository kycDocumentRepository;
    private final TransactionRepository transactionRepository;
    private final ModelMapper modelMapper;

    @Value("${app.banking.account.max-active-per-type:1}")
    private int maxActiveAccountsPerType = 1;

    @Override
    public AccountResponse openAccountForCurrentCustomer(CreateAccountRequest request) {
        if (request == null || request.getAccountType() == null) {
            throw new BusinessException("Account type is mandatory.");
        }

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
            throw new BusinessException("User is unauthenticated.");
        }

        JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
        Long userId = jwt.getUserId();

        Customer customer = customerRepository.findById(userId)
                .orElseThrow(() ->
                        new BusinessException("Customer profile not found."));

        // 1. Check KYC Status — Must be APPROVED
        KycDocuments kyc = kycDocumentRepository.findByCustomer(customer);
        if (kyc == null || kyc.getStatus() != Status.APPROVED) {
            throw new BusinessException("KYC verification must be APPROVED before opening a new account.");
        }

        // 2. Check active account limits (CLOSED accounts do not count)
        long activeCount = accountRepository.countByCustomerAndAccountTypeAndStatus(
                customer, request.getAccountType(), AccountStatus.ACTIVE);

        if (activeCount >= maxActiveAccountsPerType) {
            String typeName = request.getAccountType() == AccountType.SAVINGS ? "Savings" : "Current";
            throw new BusinessException(
                    "You already have an active " + typeName + " account. Close it before opening a new one, or contact support.");
        }

        // 3. Current account audit flag
        if (request.getAccountType() == AccountType.CURRENT && activeCount >= 1) {
            log.info("Opening additional CURRENT account for customer #{}. Business registration proof required.", customer.getCustomerId());
        }

        BigDecimal initialDeposit = request.getInitialDeposit() != null && request.getInitialDeposit().compareTo(BigDecimal.ZERO) > 0
                ? request.getInitialDeposit()
                : BigDecimal.ZERO;

        // 4. Create new ACTIVE account
        Account account = new Account();
        account.setCustomer(customer);
        account.setAccountType(request.getAccountType());
        account.setBalance(initialDeposit);
        account.setAccountNumber(generateAccountNumber());
        account.setIfscCode(generateIfscCode());
        account.setStatus(AccountStatus.ACTIVE);

        Account savedAccount = accountRepository.save(account);

        // 5. If initial deposit > 0, log audit transaction
        if (initialDeposit.compareTo(BigDecimal.ZERO) > 0) {
            Transaction transaction = new Transaction();
            transaction.setFromAccount(null); // Direct deposit / initial funding
            transaction.setToAccount(savedAccount);
            transaction.setAmount(initialDeposit);
            transaction.setTransactionType(TransactionType.DEPOSIT);
            transaction.setReferenceNumber("INIT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction.setRemarks("Initial Account Opening Deposit");
            transactionRepository.save(transaction);
        }

        return modelMapper.map(savedAccount, AccountResponse.class);
    }

    @Override
    public ApiResponse depositSelf(DepositRequestDTO request) {
        if (request == null || request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Valid deposit amount is mandatory.");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
            throw new BusinessException("User is unauthenticated.");
        }

        JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
        Long userId = jwt.getUserId();

        Customer customer = customerRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Customer profile not found."));

        Account account;
        if (request.getAccountNumber() != null && !request.getAccountNumber().isBlank()) {
            account = accountRepository.findByAccountNumber(request.getAccountNumber())
                    .orElseThrow(() -> new BusinessException("Account #" + request.getAccountNumber() + " not found."));
        } else if (request.getAccountType() != null) {
            account = accountRepository.findFirstByCustomerAndAccountTypeAndStatus(customer, request.getAccountType(), AccountStatus.ACTIVE)
                    .orElse(accountRepository.findByCustomerAndAccountType(customer, request.getAccountType()));
        } else {
            account = accountRepository.findFirstByCustomerAndAccountTypeAndStatus(customer, AccountType.SAVINGS, AccountStatus.ACTIVE)
                    .orElse(null);
        }

        if (account == null) {
            throw new BusinessException("Active account not found for deposit.");
        }

        if (!account.getCustomer().getCustomerId().equals(customer.getCustomerId())) {
            throw new AccessDeniedException("You can only deposit funds into your own accounts.");
        }

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BusinessException("Account #" + account.getAccountNumber() + " is inactive or closed.");
        }

        // Credit Account Balance
        account.setBalance(account.getBalance() != null ? account.getBalance().add(request.getAmount()) : request.getAmount());
        accountRepository.save(account);

        // Record Transaction
        String method = request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank()
                ? request.getPaymentMethod().toUpperCase()
                : "UPI";

        String refNum = request.getReferenceNumber() != null && !request.getReferenceNumber().isBlank()
                ? request.getReferenceNumber()
                : method + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        String remarks = request.getRemarks() != null && !request.getRemarks().isBlank()
                ? request.getRemarks()
                : "Self-Service Deposit via " + method;

        Transaction transaction = new Transaction();
        transaction.setFromAccount(null);
        transaction.setToAccount(account);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType(TransactionType.DEPOSIT);
        transaction.setReferenceNumber(refNum);
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setRemarks(remarks);
        transactionRepository.save(transaction);

        return new ApiResponse("SUCCESS", "₹" + request.getAmount().toPlainString() + " deposited successfully into account " + account.getAccountNumber() + " (Ref: " + refNum + ")");
    }

    @Override
    public ApiResponse depositEmployee(EmployeeDepositRequestDTO request) {
        if (request == null || request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Valid deposit amount is mandatory.");
        }

        if (request.getAccountNumber() == null || request.getAccountNumber().isBlank()) {
            throw new BusinessException("Customer account number is mandatory.");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
            throw new BusinessException("Staff user is unauthenticated.");
        }

        JwtDTO jwt = (JwtDTO) authentication.getPrincipal();

        Account account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new BusinessException("Account #" + request.getAccountNumber() + " not found."));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BusinessException("Account #" + account.getAccountNumber() + " is inactive or closed.");
        }

        // Credit Account Balance
        account.setBalance(account.getBalance() != null ? account.getBalance().add(request.getAmount()) : request.getAmount());
        accountRepository.save(account);

        String type = request.getDepositType() != null && !request.getDepositType().isBlank()
                ? request.getDepositType().toUpperCase()
                : "CASH";

        String refNum = request.getReferenceNumber() != null && !request.getReferenceNumber().isBlank()
                ? request.getReferenceNumber()
                : "SLIP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        String depositor = request.getDepositorName() != null && !request.getDepositorName().isBlank()
                ? " (Depositor: " + request.getDepositorName() + ")"
                : "";

        String staffNote = "Teller " + type + " Deposit by Staff #" + jwt.getUserId() + depositor;
        if (request.getRemarks() != null && !request.getRemarks().isBlank()) {
            staffNote += " - " + request.getRemarks();
        }

        Transaction transaction = new Transaction();
        transaction.setFromAccount(null);
        transaction.setToAccount(account);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType(TransactionType.DEPOSIT);
        transaction.setReferenceNumber(refNum);
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setRemarks(staffNote);
        transactionRepository.save(transaction);

        return new ApiResponse("SUCCESS", "Teller " + type + " deposit of ₹" + request.getAmount().toPlainString() + " processed successfully for account " + account.getAccountNumber());
    }

    @Override
    public AccountResponse createAccount(AccountType accType , Customer customer) {
        KycDocuments kycAccount = kycDocumentRepository.findByCustomer(customer);
        if (kycAccount == null) {
        	return null;
        }
        Account account = new Account();
        account.setCustomer(customer);
        account.setAccountType(accType);
        account.setBalance(BigDecimal.valueOf(0.0));
        account.setAccountNumber(generateAccountNumber());
        account.setIfscCode(generateIfscCode());
        account.setStatus(AccountStatus.CLOSED);

        Account savedAccount = accountRepository.save(account);
        return modelMapper.map(savedAccount, AccountResponse.class);
    }

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
                        new BusinessException("Account not found"));

        if (account.getAccountNumber().equals("0000000000000")) {
        	if (!jwtDTO.getRoleName().equals(Role.MANAGER)) {
        		return new ApiResponse("failure","You cannot access this internal bank ledger.");
        	}
        }

        Long ownerId = account.getCustomer()
                              .getUser()
                              .getUserId();

        if (!ownerId.equals(loggedInUserId) && !jwtDTO.getRoleName().equals(Role.MANAGER) && !jwtDTO.getRoleName().equals(Role.EMPLOYEE)) {
            throw new AccessDeniedException(
                    "You are not authorized to access this account.");
        }
        
        AccountResponse response =
                modelMapper.map(account, AccountResponse.class);
        return new ApiResponse("success", response);
    }
    
    @Override
    public ApiResponse getAccountByNumber(String accountNumber) {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        JwtDTO jwtDTO = (JwtDTO) authentication.getPrincipal();
        Long loggedInUserId = jwtDTO.getUserId();

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() ->
                        new BusinessException("Account not found"));

        Long ownerId = account.getCustomer()
                              .getUser()
                              .getUserId();

        if (!ownerId.equals(loggedInUserId) && !jwtDTO.getRoleName().equals(Role.MANAGER) && !jwtDTO.getRoleName().equals(Role.EMPLOYEE)) {
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
        
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new BusinessException("Customer not found"));

        if (!customer.getCustomerId().equals(loggedInUserId) && !jwtDTO.getRoleName().equals(Role.MANAGER) && !jwtDTO.getRoleName().equals(Role.EMPLOYEE)) {
        	throw new AccessDeniedException(
                    "You are not authorized to access this account list.");
        }

        List<Account> accounts =
                accountRepository.findByCustomer(customer);

        return new ApiResponse("success", accounts.stream()
                .map(account -> modelMapper.map(account, AccountResponse.class))
                .collect(Collectors.toList()));
    }

	@Override
	public ResponseEntity<?> getBalance(AccountType accountType) {
		Authentication authentication =
    	        SecurityContextHolder.getContext().getAuthentication();
		
		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
    	Long userId = jwt.getUserId();
    	
    	Customer customer = customerRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Customer profile not found."));
    	
    	try {
            Account account = accountRepository.findFirstByCustomerAndAccountTypeAndStatus(customer, accountType, AccountStatus.ACTIVE)
                    .orElse(accountRepository.findByCustomerAndAccountType(customer, accountType));
            if (account == null) {
                return ResponseEntity.ok(BigDecimal.ZERO);
            }
    		return ResponseEntity.ok(account.getBalance() != null ? account.getBalance() : BigDecimal.ZERO);
    	} catch(Exception ex) {
    		return ResponseEntity.badRequest().body("ERROR: " + ex.getMessage());
    	}
	}
}
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
import com.finix.common.exception.BusinessException;
import com.finix.customer.entity.Customer;
import com.finix.customer.repository.CustomerRepository;
import com.finix.kyc.entity.KycDocuments;
import com.finix.kyc.entity.Status;
import com.finix.kyc.repository.KycDocumentRepository;
import com.finix.transaction.entity.Transaction;
import com.finix.transaction.repository.TransactionRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private KycDocumentRepository kycDocumentRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Spy
    private ModelMapper modelMapper = new ModelMapper();

    @InjectMocks
    private AccountServiceImpl accountService;

    private Customer mockCustomer;
    private KycDocuments approvedKyc;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(accountService, "maxActiveAccountsPerType", 1);

        mockCustomer = new Customer();
        mockCustomer.setCustomerId(100L);

        approvedKyc = new KycDocuments();
        approvedKyc.setId(1L);
        approvedKyc.setCustomer(mockCustomer);
        approvedKyc.setStatus(Status.APPROVED);

        JwtDTO jwt = new JwtDTO(100L, "CUSTOMER", "test@finixbank.com");
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(jwt, null, null);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("1. Under Limit (0 active accounts) -> Successfully opens 1st SAVINGS account")
    void testOpenAccount_UnderLimit_FirstAccount_Success() {
        CreateAccountRequest request = new CreateAccountRequest(AccountType.SAVINGS, BigDecimal.ZERO);

        when(customerRepository.findById(100L)).thenReturn(Optional.of(mockCustomer));
        when(kycDocumentRepository.findByCustomer(mockCustomer)).thenReturn(approvedKyc);
        when(accountRepository.countByCustomerAndAccountTypeAndStatus(
                mockCustomer, AccountType.SAVINGS, AccountStatus.ACTIVE)).thenReturn(0L);
        when(accountRepository.existsByAccountNumber(any())).thenReturn(false);

        Account savedAccount = Account.builder()
                .accountId(1L)
                .customer(mockCustomer)
                .accountNumber("123456789012")
                .accountType(AccountType.SAVINGS)
                .balance(BigDecimal.ZERO)
                .ifscCode("FINX0000001")
                .status(AccountStatus.ACTIVE)
                .build();
        when(accountRepository.save(any(Account.class))).thenReturn(savedAccount);

        AccountResponse response = accountService.openAccountForCurrentCustomer(request);

        assertNotNull(response);
        assertEquals(AccountType.SAVINGS, response.getAccountType());
        assertEquals("123456789012", response.getAccountNumber());
        assertEquals(AccountStatus.ACTIVE, response.getStatus());
        verify(accountRepository, times(1)).save(any(Account.class));
        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("2. Open Account with Initial Deposit -> Saves Account & Creates Audit Transaction")
    void testOpenAccount_WithInitialDeposit_Success() {
        CreateAccountRequest request = new CreateAccountRequest(AccountType.SAVINGS, BigDecimal.valueOf(15000));

        when(customerRepository.findById(100L)).thenReturn(Optional.of(mockCustomer));
        when(kycDocumentRepository.findByCustomer(mockCustomer)).thenReturn(approvedKyc);
        when(accountRepository.countByCustomerAndAccountTypeAndStatus(
                mockCustomer, AccountType.SAVINGS, AccountStatus.ACTIVE)).thenReturn(0L);
        when(accountRepository.existsByAccountNumber(any())).thenReturn(false);

        Account savedAccount = Account.builder()
                .accountId(1L)
                .customer(mockCustomer)
                .accountNumber("123456789012")
                .accountType(AccountType.SAVINGS)
                .balance(BigDecimal.valueOf(15000))
                .ifscCode("FINX0000001")
                .status(AccountStatus.ACTIVE)
                .build();
        when(accountRepository.save(any(Account.class))).thenReturn(savedAccount);

        AccountResponse response = accountService.openAccountForCurrentCustomer(request);

        assertNotNull(response);
        verify(accountRepository, times(1)).save(any(Account.class));
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    @DisplayName("3. Self-Service Deposit -> Successfully Credits Account & Logs Transaction")
    void testDepositSelf_Success() {
        Account activeAccount = Account.builder()
                .accountId(1L)
                .customer(mockCustomer)
                .accountNumber("123456789012")
                .accountType(AccountType.SAVINGS)
                .balance(BigDecimal.valueOf(5000))
                .status(AccountStatus.ACTIVE)
                .build();

        DepositRequestDTO request = new DepositRequestDTO(
                AccountType.SAVINGS, "123456789012", BigDecimal.valueOf(10000), "UPI", "UPI-12345", "Test deposit");

        when(customerRepository.findById(100L)).thenReturn(Optional.of(mockCustomer));
        when(accountRepository.findByAccountNumber("123456789012")).thenReturn(Optional.of(activeAccount));

        ApiResponse response = accountService.depositSelf(request);

        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());
        assertEquals(BigDecimal.valueOf(15000), activeAccount.getBalance()); // 5000 + 10000
        verify(accountRepository, times(1)).save(activeAccount);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    @DisplayName("4. Teller/Staff-Assisted Deposit -> Credits Account with Staff Reference")
    void testDepositEmployee_Success() {
        JwtDTO staffJwt = new JwtDTO(50L, "EMPLOYEE", "teller@finixbank.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(staffJwt, null, null));

        Account customerAccount = Account.builder()
                .accountId(2L)
                .customer(mockCustomer)
                .accountNumber("987654321098")
                .accountType(AccountType.SAVINGS)
                .balance(BigDecimal.valueOf(2000))
                .status(AccountStatus.ACTIVE)
                .build();

        EmployeeDepositRequestDTO request = new EmployeeDepositRequestDTO(
                "987654321098", BigDecimal.valueOf(25000), "CASH", "SLIP-8888", "John Doe", "Cash Counter Deposit");

        when(accountRepository.findByAccountNumber("987654321098")).thenReturn(Optional.of(customerAccount));

        ApiResponse response = accountService.depositEmployee(request);

        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());
        assertEquals(BigDecimal.valueOf(27000), customerAccount.getBalance()); // 2000 + 25000
        verify(accountRepository, times(1)).save(customerAccount);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    @DisplayName("5. At Limit (1 active SAVINGS account) -> Rejects with clear message")
    void testOpenAccount_AtLimit_Savings_ThrowsBusinessException() {
        CreateAccountRequest request = new CreateAccountRequest(AccountType.SAVINGS, BigDecimal.ZERO);

        when(customerRepository.findById(100L)).thenReturn(Optional.of(mockCustomer));
        when(kycDocumentRepository.findByCustomer(mockCustomer)).thenReturn(approvedKyc);
        when(accountRepository.countByCustomerAndAccountTypeAndStatus(
                mockCustomer, AccountType.SAVINGS, AccountStatus.ACTIVE)).thenReturn(1L);

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            accountService.openAccountForCurrentCustomer(request);
        });

        assertEquals(
            "You already have an active Savings account. Close it before opening a new one, or contact support.",
            exception.getMessage()
        );
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    @DisplayName("6. Unapproved KYC (PENDING) -> Rejects with BusinessException")
    void testOpenAccount_PendingKyc_ThrowsBusinessException() {
        CreateAccountRequest request = new CreateAccountRequest(AccountType.SAVINGS, BigDecimal.ZERO);

        KycDocuments pendingKyc = new KycDocuments();
        pendingKyc.setStatus(Status.PENDING);

        when(customerRepository.findById(100L)).thenReturn(Optional.of(mockCustomer));
        when(kycDocumentRepository.findByCustomer(mockCustomer)).thenReturn(pendingKyc);

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            accountService.openAccountForCurrentCustomer(request);
        });

        assertTrue(exception.getMessage().contains("KYC verification must be APPROVED"));
        verify(accountRepository, never()).save(any(Account.class));
    }
}

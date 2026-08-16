package com.finix.fd.service;

import com.finix.account.entity.Account;
import com.finix.account.entity.AccountStatus;
import com.finix.account.entity.AccountType;
import com.finix.account.repository.AccountRepository;
import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.JwtDTO;
import com.finix.common.exception.BusinessException;
import com.finix.customer.entity.Customer;
import com.finix.customer.repository.CustomerRepository;
import com.finix.fd.dto.FDRequestDTO;
import com.finix.fd.dto.FDResponseDTO;
import com.finix.fd.entity.FixedDeposits;
import com.finix.fd.entity.Status;
import com.finix.fd.entity.Tenure;
import com.finix.fd.repository.FixedDepositRepository;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FixedDepositServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private FixedDepositRepository fixedDepositRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Spy
    private ModelMapper modelMapper = new ModelMapper();

    @InjectMocks
    private FixedDepositServiceImpl fixedDepositService;

    private Customer mockCustomer;
    private Account mockAccount;

    @BeforeEach
    void setUp() {
        mockCustomer = new Customer();
        mockCustomer.setCustomerId(100L);

        mockAccount = Account.builder()
                .accountId(1L)
                .customer(mockCustomer)
                .accountNumber("123456789012")
                .accountType(AccountType.SAVINGS)
                .balance(BigDecimal.valueOf(50000))
                .status(AccountStatus.ACTIVE)
                .build();

        JwtDTO jwt = new JwtDTO(100L, "CUSTOMER", "customer@finixbank.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(jwt, null, null));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("1. Create FD with Sufficient Balance -> Success and Debited Balance")
    void testCreateFD_Success() {
        FDRequestDTO request = new FDRequestDTO(AccountType.SAVINGS, BigDecimal.valueOf(20000), Tenure.ONE_YEAR);

        when(customerRepository.findById(100L)).thenReturn(Optional.of(mockCustomer));
        when(accountRepository.findFirstByCustomerAndAccountTypeAndStatus(mockCustomer, AccountType.SAVINGS, AccountStatus.ACTIVE))
                .thenReturn(Optional.of(mockAccount));

        FixedDeposits mockSavedFd = new FixedDeposits();
        mockSavedFd.setFdId(1L);
        mockSavedFd.setAccount(mockAccount);
        when(fixedDepositRepository.save(any(FixedDeposits.class))).thenReturn(mockSavedFd);

        ResponseEntity<?> response = fixedDepositService.createFD(request);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(BigDecimal.valueOf(30000), mockAccount.getBalance()); // 50000 - 20000
        verify(accountRepository, times(1)).save(mockAccount);
        verify(fixedDepositRepository, times(1)).save(any(FixedDeposits.class));
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    @DisplayName("2. Create FD with Insufficient Balance -> Throws BusinessException")
    void testCreateFD_InsufficientBalance_ThrowsBusinessException() {
        FDRequestDTO request = new FDRequestDTO(AccountType.SAVINGS, BigDecimal.valueOf(70000), Tenure.ONE_YEAR);

        when(customerRepository.findById(100L)).thenReturn(Optional.of(mockCustomer));
        when(accountRepository.findFirstByCustomerAndAccountTypeAndStatus(mockCustomer, AccountType.SAVINGS, AccountStatus.ACTIVE))
                .thenReturn(Optional.of(mockAccount));

        BusinessException ex = assertThrows(BusinessException.class, () -> {
            fixedDepositService.createFD(request);
        });

        assertTrue(ex.getMessage().contains("Insufficient balance"));
        verify(accountRepository, never()).save(any());
        verify(fixedDepositRepository, never()).save(any());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("3. Create FD with Missing Account -> Throws BusinessException")
    void testCreateFD_MissingAccount_ThrowsBusinessException() {
        FDRequestDTO request = new FDRequestDTO(AccountType.CURRENT, BigDecimal.valueOf(10000), Tenure.TWO_YEARS);

        when(customerRepository.findById(100L)).thenReturn(Optional.of(mockCustomer));
        when(accountRepository.findFirstByCustomerAndAccountTypeAndStatus(mockCustomer, AccountType.CURRENT, AccountStatus.ACTIVE))
                .thenReturn(Optional.empty());
        when(accountRepository.findByCustomerAndAccountType(mockCustomer, AccountType.CURRENT))
                .thenReturn(null);

        BusinessException ex = assertThrows(BusinessException.class, () -> {
            fixedDepositService.createFD(request);
        });

        assertTrue(ex.getMessage().contains("You do not have an active CURRENT account"));
        verify(fixedDepositRepository, never()).save(any());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("4. Get FD Details for existing account -> Returns list with calculated maturity")
    void testGetFDDetails_Success() {
        FixedDeposits fd = new FixedDeposits();
        fd.setFdId(5L);
        fd.setAccount(mockAccount);
        fd.setDepositAmount(BigDecimal.valueOf(10000));
        fd.setInterestRate(6.5);
        fd.setTenureYears(Tenure.ONE_YEAR);
        fd.setMaturityAmount(BigDecimal.valueOf(10650));
        fd.setStatus(Status.ACTIVE);

        when(customerRepository.findById(100L)).thenReturn(Optional.of(mockCustomer));
        when(accountRepository.findFirstByCustomerAndAccountTypeAndStatus(mockCustomer, AccountType.SAVINGS, AccountStatus.ACTIVE))
                .thenReturn(Optional.of(mockAccount));
        when(fixedDepositRepository.findByAccount(mockAccount)).thenReturn(List.of(fd));

        ResponseEntity<?> response = fixedDepositService.getFDDetails(AccountType.SAVINGS);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        List<FDResponseDTO> dtoList = (List<FDResponseDTO>) response.getBody();
        assertNotNull(dtoList);
        assertEquals(1, dtoList.size());
        assertEquals(6.5, dtoList.get(0).getInterestRate());
        assertEquals(BigDecimal.valueOf(10650), dtoList.get(0).getMaturityAmount());
        assertEquals(Status.ACTIVE, dtoList.get(0).getStatus());
    }
}

package com.finix.kyc.service;

import com.finix.account.entity.Account;
import com.finix.account.entity.AccountStatus;
import com.finix.account.entity.AccountType;
import com.finix.account.repository.AccountRepository;
import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.JwtDTO;
import com.finix.auth.entity.Role;
import com.finix.auth.service.AuditLogService;
import com.finix.common.exception.AccessDeniedException;
import com.finix.customer.entity.Customer;
import com.finix.employee.entity.Department;
import com.finix.employee.entity.Designation;
import com.finix.employee.entity.Employee;
import com.finix.employee.repository.EmployeeRepository;
import com.finix.kyc.dto.StatusDto;
import com.finix.kyc.entity.KycDocuments;
import com.finix.kyc.entity.Status;
import com.finix.kyc.repository.KycDocumentRepository;
import com.finix.notification.producer.NotificationProducer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KycServiceAuthorizationTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private KycDocumentRepository kycDocumentRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private NotificationProducer notificationProducer;

    @InjectMocks
    private KycServiceImpl kycService;

    private Employee kycOfficer;
    private Employee loanOfficer;
    private KycDocuments mockKyc;
    private Customer mockCustomer;

    @BeforeEach
    void setUp() {
        kycOfficer = new Employee();
        kycOfficer.setEmployeeId(301L);
        kycOfficer.setDepartment(Department.KYC);
        kycOfficer.setDesignation(Designation.KYC_OFFICER);

        loanOfficer = new Employee();
        loanOfficer.setEmployeeId(302L);
        loanOfficer.setDepartment(Department.LOANS);
        loanOfficer.setDesignation(Designation.LOAN_OFFICER);

        mockCustomer = new Customer();
        mockCustomer.setCustomerId(500L);

        mockKyc = new KycDocuments();
        mockKyc.setId(10L);
        mockKyc.setCustomer(mockCustomer);
        mockKyc.setStatus(Status.PENDING);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("1. KYC Officer Authorized -> Successfully approves KYC")
    void testUpdateStatus_KycOfficer_Success() {
        JwtDTO jwt = new JwtDTO(301L, "EMPLOYEE", "kycofficer@finixbank.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(jwt, null, null));

        when(employeeRepository.findById(301L)).thenReturn(Optional.of(kycOfficer));
        when(kycDocumentRepository.findById(10L)).thenReturn(Optional.of(mockKyc));

        StatusDto statusDto = new StatusDto();
        statusDto.setStatus(Status.APPROVED);
        statusDto.setAccountType(AccountType.SAVINGS);

        ApiResponse response = kycService.updateStatus(10L, statusDto);

        assertNotNull(response);
        assertEquals("success", response.getStatus());
        assertEquals(Status.APPROVED, mockKyc.getStatus());
        verify(employeeRepository, times(1)).findById(301L);
    }

    @Test
    @DisplayName("2. Non-KYC Officer (Loan Officer) -> Throws AccessDeniedException (403)")
    void testUpdateStatus_WrongDesignation_ThrowsAccessDeniedException() {
        JwtDTO jwt = new JwtDTO(302L, "EMPLOYEE", "loanofficer@finixbank.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(jwt, null, null));

        when(employeeRepository.findById(302L)).thenReturn(Optional.of(loanOfficer));

        StatusDto statusDto = new StatusDto();
        statusDto.setStatus(Status.APPROVED);

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> {
            kycService.updateStatus(10L, statusDto);
        });

        assertTrue(ex.getMessage().contains("You are not authorized to perform KYC verification"));
        verify(kycDocumentRepository, never()).findById(any());
    }

    @Test
    @DisplayName("3. Manager Override -> Approves KYC & logs Audit Trail")
    void testUpdateStatus_ManagerOverride_SuccessAndAudited() {
        JwtDTO jwt = new JwtDTO(999L, "MANAGER", "manager@finixbank.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(jwt, null, null));

        when(kycDocumentRepository.findById(10L)).thenReturn(Optional.of(mockKyc));

        StatusDto statusDto = new StatusDto();
        statusDto.setStatus(Status.APPROVED);
        statusDto.setAccountType(AccountType.SAVINGS);

        ApiResponse response = kycService.updateStatus(10L, statusDto);

        assertNotNull(response);
        assertEquals("success", response.getStatus());
        assertEquals(Status.APPROVED, mockKyc.getStatus());

        // Manager bypasses employee check
        verify(employeeRepository, never()).findById(any());
        // Manager override is logged to audit trail
        verify(auditLogService, times(1)).logManagerOverride(
                eq(999L),
                eq("APPROVE_KYC"),
                eq("KYC"),
                eq(10L),
                any()
        );
    }

    @Test
    @DisplayName("4. Customer Direct Access -> Throws AccessDeniedException (403)")
    void testUpdateStatus_Customer_ThrowsAccessDeniedException() {
        JwtDTO jwt = new JwtDTO(500L, "CUSTOMER", "customer@finixbank.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(jwt, null, null));

        StatusDto statusDto = new StatusDto();
        statusDto.setStatus(Status.APPROVED);

        assertThrows(AccessDeniedException.class, () -> {
            kycService.updateStatus(10L, statusDto);
        });
    }
}

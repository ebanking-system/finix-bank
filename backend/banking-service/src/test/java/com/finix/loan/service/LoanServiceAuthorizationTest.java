package com.finix.loan.service;

import com.finix.auth.dto.JwtDTO;
import com.finix.auth.entity.Role;
import com.finix.auth.service.AuditLogService;
import com.finix.common.exception.AccessDeniedException;
import com.finix.employee.entity.Department;
import com.finix.employee.entity.Designation;
import com.finix.employee.entity.Employee;
import com.finix.employee.repository.EmployeeRepository;
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
class LoanServiceAuthorizationTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuthorizationServiceImpl authorizationService;

    private Employee loanOfficer;
    private Employee kycOfficer;

    @BeforeEach
    void setUp() {
        loanOfficer = new Employee();
        loanOfficer.setEmployeeId(201L);
        loanOfficer.setDepartment(Department.LOANS);
        loanOfficer.setDesignation(Designation.LOAN_OFFICER);

        kycOfficer = new Employee();
        kycOfficer.setEmployeeId(202L);
        kycOfficer.setDepartment(Department.KYC);
        kycOfficer.setDesignation(Designation.KYC_OFFICER);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("1. Loan Officer Authorized -> Successfully authorizes operation")
    void testAuthorize_LoanOfficer_Success() {
        JwtDTO jwt = new JwtDTO(201L, "EMPLOYEE", "loanofficer@finixbank.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(jwt, null, null));

        when(employeeRepository.findById(201L)).thenReturn(Optional.of(loanOfficer));

        assertDoesNotThrow(() -> {
            authorizationService.authorize(Department.LOANS, Designation.LOAN_OFFICER);
        });

        verify(employeeRepository, times(1)).findById(201L);
    }

    @Test
    @DisplayName("2. Non-Loan Officer (KYC Officer) Direct Access -> Throws AccessDeniedException (403)")
    void testAuthorize_WrongDepartment_ThrowsAccessDeniedException() {
        JwtDTO jwt = new JwtDTO(202L, "EMPLOYEE", "kycofficer@finixbank.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(jwt, null, null));

        when(employeeRepository.findById(202L)).thenReturn(Optional.of(kycOfficer));

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> {
            authorizationService.authorize(Department.LOANS, Designation.LOAN_OFFICER);
        });

        assertTrue(ex.getMessage().contains("You are not authorized to perform this operation"));
    }

    @Test
    @DisplayName("3. Manager Role -> Bypasses Department/Designation check & records Audit Log")
    void testAuthorize_ManagerOverride_SuccessAndAudited() {
        JwtDTO jwt = new JwtDTO(999L, "MANAGER", "manager@finixbank.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(jwt, null, null));

        assertDoesNotThrow(() -> {
            authorizationService.authorize(Department.LOANS, Designation.LOAN_OFFICER);
        });

        // Manager bypasses employeeRepository check
        verify(employeeRepository, never()).findById(any());
        // Manager action is logged to audit trail
        verify(auditLogService, times(1)).logAction(
                eq(999L),
                eq("MANAGER_OPERATIONAL_OVERRIDE"),
                any()
        );
    }

    @Test
    @DisplayName("4. Unauthenticated User -> Throws AccessDeniedException (403)")
    void testAuthorize_Unauthenticated_ThrowsAccessDeniedException() {
        SecurityContextHolder.clearContext();

        assertThrows(AccessDeniedException.class, () -> {
            authorizationService.authorize(Department.LOANS, Designation.LOAN_OFFICER);
        });
    }
}

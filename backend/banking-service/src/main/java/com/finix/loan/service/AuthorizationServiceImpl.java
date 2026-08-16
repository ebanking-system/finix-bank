package com.finix.loan.service;

import org.springframework.stereotype.Service;

import com.finix.auth.dto.JwtDTO;
import com.finix.auth.entity.Role;
import com.finix.auth.service.AuditLogService;
import com.finix.common.exception.AccessDeniedException;
import com.finix.employee.entity.Department;
import com.finix.employee.entity.Designation;
import com.finix.employee.entity.Employee;
import com.finix.employee.repository.EmployeeRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthorizationServiceImpl
        implements AuthorizationService {

    private final EmployeeRepository employeeRepository;
    private final AuditLogService auditLogService;

    @Override
    public void authorize(Department department,
                          Designation designation) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
            throw new AccessDeniedException("User is unauthenticated.");
        }

        JwtDTO jwt =
                (JwtDTO) authentication.getPrincipal();

        // Manager role bypasses department/designation checks with audit trail logging
        if (Role.MANAGER.name().equals(jwt.getRoleName())) {
            log.info("[MANAGER-OVERRIDE] Manager #{} accessed operational module [Dept: {}, Desig: {}]",
                    jwt.getUserId(), department, designation);
            auditLogService.logAction(
                    jwt.getUserId(),
                    "MANAGER_OPERATIONAL_OVERRIDE",
                    String.format("Manager override applied for Department: %s, Designation: %s", department, designation)
            );
            return;
        }

        Employee employee = employeeRepository
                .findById(jwt.getUserId())
                .orElseThrow(() ->
                        new AccessDeniedException("Employee record not found for user ID: " + jwt.getUserId()));

        if (employee.getDepartment() != department ||
            employee.getDesignation() != designation) {

            log.warn("[ACCESS-DENIED] Employee #{} (Dept: {}, Desig: {}) attempted unauthorized operation in [Dept: {}, Desig: {}]",
                    jwt.getUserId(), employee.getDepartment(), employee.getDesignation(), department, designation);

            throw new AccessDeniedException(
                    "You are not authorized to perform this operation. Required: " + department + " " + designation);
        }
    }
}
package com.finix.loan.service;

import org.springframework.stereotype.Service;

import com.finix.auth.dto.JwtDTO;
import com.finix.auth.entity.Role;
import com.finix.common.exception.AccessDeniedException;
import com.finix.employee.entity.Department;
import com.finix.employee.entity.Designation;
import com.finix.employee.entity.Employee;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthorizationServiceImpl
        implements AuthorizationService {

//    private final EmployeeRepository employeeRepository;

    @Override
    public void authorize(Department department,
                          Designation designation) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        JwtDTO jwt =
                (JwtDTO) authentication.getPrincipal();

        // Manager role bypasses department/designation checks
        if (Role.MANAGER.name().equals(jwt.getRoleName())) {
            return;
        }

//        Employee employee = employeeRepository
//                .findById(jwt.getUserId())
//                .orElseThrow(() ->
//                        new RuntimeException("Employee not found"));

//        if (employee.getDepartment() != department ||
//            employee.getDesignation() != designation) {
//
//            throw new AccessDeniedException(
//                    "You are not authorized to perform this operation.");
//        }
    }
}
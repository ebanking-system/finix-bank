package com.finix.employee.service;

import org.springframework.web.multipart.MultipartFile;

import com.finix.auth.dto.ApiResponse;
import com.finix.employee.dto.EmployeeChangePasswordRequest;
import com.finix.employee.dto.UpdateEmployeeAssignmentRequest;
import com.finix.employee.dto.UpdateEmployeeRequest;

public interface EmployeeService {

	ApiResponse getMyProfile();

	ApiResponse updateMyProfile(UpdateEmployeeRequest request);

	ApiResponse uploadProfilePhoto(MultipartFile file);

	ApiResponse changePassword(EmployeeChangePasswordRequest request);

	ApiResponse getAllEmployees();

	ApiResponse getEmployeeById(Long employeeId);

	ApiResponse updateEmployeeAssignment(Long employeeId, UpdateEmployeeAssignmentRequest request);

	ApiResponse deleteEmployee(Long employeeId);
}
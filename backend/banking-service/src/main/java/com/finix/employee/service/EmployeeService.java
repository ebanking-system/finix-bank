package com.finix.employee.service;

import com.finix.auth.dto.ApiResponse;
import com.finix.employee.dto.EmployeeRegistrationDto;
import com.finix.employee.dto.UpdateEmployeeAssignmentRequest;
import com.finix.employee.dto.UpdateEmployeeRequest;

public interface EmployeeService {

//	ApiResponse registerEmployee(EmployeeRegistrationDto request);

	ApiResponse getMyProfile();

	ApiResponse updateMyProfile(UpdateEmployeeRequest request);

	ApiResponse getAllEmployees();

	ApiResponse getEmployeeById(Long employeeId);

	ApiResponse updateEmployeeAssignment(Long employeeId, UpdateEmployeeAssignmentRequest request);

	ApiResponse deleteEmployee(Long employeeId);

}
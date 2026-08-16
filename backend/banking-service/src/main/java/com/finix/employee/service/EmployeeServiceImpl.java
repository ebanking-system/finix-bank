package com.finix.employee.service;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.JwtDTO;
import com.finix.auth.entity.Role;
import com.finix.auth.entity.User;
import com.finix.auth.repository.UserRepository;
import com.finix.common.exception.ResourceNotFoundException;
import com.finix.employee.dto.EmployeeRegistrationDto;
import com.finix.employee.dto.EmployeeResponse;
import com.finix.employee.dto.UpdateEmployeeAssignmentRequest;
import com.finix.employee.dto.UpdateEmployeeRequest;
import com.finix.employee.entity.Employee;
import com.finix.employee.repository.EmployeeRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

	private final EmployeeRepository employeeRepository;
	private final UserRepository userRepository;
	private final ModelMapper mapper;
	private final PasswordEncoder encoder;

//	@Override
//	public ApiResponse registerEmployee(EmployeeRegistrationDto request) {
//
//		if (userRepository.existsByEmail(request.getEmail())) {
//			return new ApiResponse("Failure", "Account Already Exist");
//		}
//
//		try {
//			User user = mapper.map(request, User.class);
//			user.setRole(Role.EMPLOYEE);
//			user.setPasswordHash(encoder.encode(request.getPasswordHash()));
//			userRepository.save(user);
//
//			Employee employee = mapper.map(request, Employee.class);
//			employee.setUser(user);
//			employeeRepository.save(employee);
//
//		} catch (Exception ex) {
//			return new ApiResponse("Failure", ex.getMessage());
//		}
//
//		return new ApiResponse("Success", "Employee Created Successfully");
//	}

	@Override
	public ApiResponse getMyProfile() {

		Authentication authentication =
				SecurityContextHolder.getContext().getAuthentication();

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();

		Employee employee = employeeRepository.findById(jwt.getUserId())
				.orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

		return new ApiResponse("success", mapToResponse(employee));
	}

	@Override
	public ApiResponse updateMyProfile(UpdateEmployeeRequest request) {

		Authentication authentication =
				SecurityContextHolder.getContext().getAuthentication();

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();

		Employee employee = employeeRepository.findById(jwt.getUserId())
				.orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

		employee.setFirstName(request.getFirstName());
		employee.setMiddleName(request.getMiddleName());
		employee.setLastName(request.getLastName());

		return new ApiResponse("success", mapToResponse(employee));
	}

	@Override
	public ApiResponse getAllEmployees() {

		List<EmployeeResponse> response = employeeRepository.findAll()
				.stream()
				.map(this::mapToResponse)
				.collect(Collectors.toList());

		return new ApiResponse("success", response);
	}

	@Override
	public ApiResponse getEmployeeById(Long employeeId) {

		Employee employee = employeeRepository.findById(employeeId)
				.orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

		return new ApiResponse("success", mapToResponse(employee));
	}

	@Override
	public ApiResponse updateEmployeeAssignment(Long employeeId, UpdateEmployeeAssignmentRequest request) {

		Employee employee = employeeRepository.findById(employeeId)
				.orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

		employee.setDepartment(request.getDepartment());
		employee.setDesignation(request.getDesignation());

		return new ApiResponse("success", mapToResponse(employee));
	}

	@Override
	public ApiResponse deleteEmployee(Long employeeId) {
		Employee employee = employeeRepository.findById(employeeId)
				.orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

		User user = employee.getUser();
		employeeRepository.delete(employee);
		if (user != null) {
			userRepository.delete(user);
		}

		return new ApiResponse("success", "Employee deleted successfully");
	}

	private EmployeeResponse mapToResponse(Employee employee) {

		EmployeeResponse response = mapper.map(employee, EmployeeResponse.class);
		response.setEmployeeId(employee.getEmployeeId());
		response.setEmail(employee.getUser().getEmail());

		return response;
	}

}
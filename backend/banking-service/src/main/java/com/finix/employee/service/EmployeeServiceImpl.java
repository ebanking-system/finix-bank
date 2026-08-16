package com.finix.employee.service;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.JwtDTO;
import com.finix.auth.entity.User;
import com.finix.auth.repository.UserRepository;
import com.finix.common.exception.BusinessException;
import com.finix.common.exception.ResourceNotFoundException;
import com.finix.employee.dto.EmployeeChangePasswordRequest;
import com.finix.employee.dto.EmployeeResponse;
import com.finix.employee.dto.UpdateEmployeeAssignmentRequest;
import com.finix.employee.dto.UpdateEmployeeRequest;
import com.finix.employee.entity.Employee;
import com.finix.employee.repository.EmployeeRepository;
import com.finix.util.FileStorageUtil;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

	private final EmployeeRepository employeeRepository;
	private final UserRepository userRepository;
	private final ModelMapper mapper;
	private final PasswordEncoder encoder;
	private final FileStorageUtil fileStorageUtil;

	@Override
	public ApiResponse getMyProfile() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
			throw new BusinessException("User is unauthenticated.");
		}

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
		Employee employee = employeeRepository.findById(jwt.getUserId())
				.orElseThrow(() -> new ResourceNotFoundException("Employee profile not found."));

		return new ApiResponse("success", mapToResponse(employee));
	}

	@Override
	public ApiResponse updateMyProfile(UpdateEmployeeRequest request) {
		if (request == null || request.getFirstName() == null || request.getFirstName().isBlank()) {
			throw new BusinessException("First name is mandatory.");
		}

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
			throw new BusinessException("User is unauthenticated.");
		}

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
		Employee employee = employeeRepository.findById(jwt.getUserId())
				.orElseThrow(() -> new ResourceNotFoundException("Employee profile not found."));

		employee.setFirstName(request.getFirstName().trim());
		employee.setMiddleName(request.getMiddleName() != null ? request.getMiddleName().trim() : null);
		employee.setLastName(request.getLastName() != null ? request.getLastName().trim() : null);

		employeeRepository.save(employee);
		return new ApiResponse("success", mapToResponse(employee));
	}

	@Override
	public ApiResponse uploadProfilePhoto(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new BusinessException("Please select a valid image file.");
		}

		String contentType = file.getContentType();
		if (contentType == null || (!contentType.startsWith("image/"))) {
			throw new BusinessException("Profile photo must be an image (JPEG, PNG, WEBP).");
		}

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
			throw new BusinessException("User is unauthenticated.");
		}

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
		Employee employee = employeeRepository.findById(jwt.getUserId())
				.orElseThrow(() -> new ResourceNotFoundException("Employee profile not found."));

		String savedPath = fileStorageUtil.saveEmployeePhoto(file, employee.getEmployeeId());
		employee.setProfilePhotoPath(savedPath);
		employeeRepository.save(employee);

		return new ApiResponse("success", mapToResponse(employee));
	}

	@Override
	public ApiResponse changePassword(EmployeeChangePasswordRequest request) {
		if (request == null) {
			throw new BusinessException("Password change details are required.");
		}

		if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
			throw new BusinessException("Current password is required.");
		}

		if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
			throw new BusinessException("New password is required.");
		}

		if (!request.getNewPassword().equals(request.getConfirmPassword())) {
			throw new BusinessException("New password and confirm password do not match.");
		}

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
			throw new BusinessException("User is unauthenticated.");
		}

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
		User user = userRepository.findById(jwt.getUserId())
				.orElseThrow(() -> new ResourceNotFoundException("User record not found."));

		if (!encoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
			throw new BusinessException("Current password entered is incorrect.");
		}

		if (encoder.matches(request.getNewPassword(), user.getPasswordHash())) {
			throw new BusinessException("New password cannot be identical to the current password.");
		}

		user.setPasswordHash(encoder.encode(request.getNewPassword()));
		user.setMustChangePassword(false);
		userRepository.save(user);

		return new ApiResponse("success", "Password updated successfully.");
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
		if (employee.getUser() != null) {
			response.setEmail(employee.getUser().getEmail());
		}
		response.setProfilePhotoPath(employee.getProfilePhotoPath());
		return response;
	}

}
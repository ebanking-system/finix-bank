package com.finix.employee.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finix.auth.dto.ApiResponse;
import com.finix.employee.dto.EmployeeRegistrationDto;
import com.finix.employee.dto.UpdateEmployeeAssignmentRequest;
import com.finix.employee.dto.UpdateEmployeeRequest;
import com.finix.employee.service.EmployeeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

	private final EmployeeService employeeService;

//	@PostMapping("/signup")
//	public ResponseEntity<ApiResponse> registerEmployee(
//			@Valid @RequestBody EmployeeRegistrationDto request) {
//		return ResponseEntity.ok(employeeService.registerEmployee(request));
//	}

	@GetMapping("/profile")
	public ResponseEntity<ApiResponse> getMyProfile() {
		return ResponseEntity.ok(employeeService.getMyProfile());
	}

	@PatchMapping("/profile")
	public ResponseEntity<ApiResponse> updateMyProfile(
			@Valid @RequestBody UpdateEmployeeRequest request) {
		return ResponseEntity.ok(employeeService.updateMyProfile(request));
	}

	@GetMapping
	public ResponseEntity<ApiResponse> getAllEmployees() {
		return ResponseEntity.ok(employeeService.getAllEmployees());
	}

	@GetMapping("/{employeeId}")
	public ResponseEntity<ApiResponse> getEmployeeById(
			@PathVariable Long employeeId) {
		return ResponseEntity.ok(employeeService.getEmployeeById(employeeId));
	}

	@PatchMapping("/{employeeId}/assignment")
	public ResponseEntity<ApiResponse> updateEmployeeAssignment(
			@PathVariable Long employeeId,
			@Valid @RequestBody UpdateEmployeeAssignmentRequest request) {
		return ResponseEntity.ok(employeeService.updateEmployeeAssignment(employeeId, request));
	}

	@DeleteMapping("/{employeeId}")
	public ResponseEntity<ApiResponse> deleteEmployee(@PathVariable Long employeeId) {
		return ResponseEntity.ok(employeeService.deleteEmployee(employeeId));
	}

}
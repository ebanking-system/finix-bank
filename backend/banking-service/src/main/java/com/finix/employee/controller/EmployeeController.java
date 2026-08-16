package com.finix.employee.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.finix.auth.dto.ApiResponse;
import com.finix.employee.dto.EmployeeChangePasswordRequest;
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

	@GetMapping("/profile")
	public ResponseEntity<ApiResponse> getMyProfile() {
		return ResponseEntity.ok(employeeService.getMyProfile());
	}

	@PatchMapping("/profile")
	public ResponseEntity<ApiResponse> updateMyProfile(
			@Valid @RequestBody UpdateEmployeeRequest request) {
		return ResponseEntity.ok(employeeService.updateMyProfile(request));
	}

	@PostMapping("/profile/photo")
	public ResponseEntity<ApiResponse> uploadProfilePhoto(@RequestParam("file") MultipartFile file) {
		return ResponseEntity.ok(employeeService.uploadProfilePhoto(file));
	}

	@PostMapping("/profile/change-password")
	public ResponseEntity<ApiResponse> changePassword(
			@Valid @RequestBody EmployeeChangePasswordRequest request) {
		return ResponseEntity.ok(employeeService.changePassword(request));
	}

	@GetMapping("/photo/{employeeId}/{fileName}")
	public ResponseEntity<Resource> getEmployeePhoto(
			@PathVariable Long employeeId,
			@PathVariable String fileName) {
		try {
			Path filePath = Paths.get("uploads", "profiles", "employee_" + employeeId, fileName);
			if (!Files.exists(filePath)) {
				return ResponseEntity.notFound().build();
			}
			Resource resource = new UrlResource(filePath.toUri());
			String contentType = Files.probeContentType(filePath);
			if (contentType == null) {
				contentType = "image/jpeg";
			}
			return ResponseEntity.ok()
					.contentType(MediaType.parseMediaType(contentType))
					.header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
					.body(resource);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().build();
		}
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
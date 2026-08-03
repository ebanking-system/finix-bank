package com.finix.customer.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finix.auth.dto.ApiResponse;
import com.finix.customer.dto.UpdateCustomerRequest;
import com.finix.customer.service.CustomerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

	private final CustomerService customerService;

	@GetMapping("/profile")
	public ResponseEntity<ApiResponse> getMyProfile() {
		return ResponseEntity.ok(customerService.getMyProfile());
	}

	@PatchMapping("/profile")
	public ResponseEntity<ApiResponse> updateMyProfile(
			@Valid @RequestBody UpdateCustomerRequest request) {
		return ResponseEntity.ok(customerService.updateMyProfile(request));
	}

}
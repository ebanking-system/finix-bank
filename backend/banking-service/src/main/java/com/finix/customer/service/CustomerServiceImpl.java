package com.finix.customer.service;

import org.modelmapper.ModelMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.JwtDTO;
import com.finix.common.exception.ResourceNotFoundException;
import com.finix.customer.dto.CustomerResponse;
import com.finix.customer.dto.UpdateCustomerRequest;
import com.finix.customer.entity.Customer;
import com.finix.customer.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

	private final CustomerRepository customerRepository;
	private final ModelMapper modelMapper;

	@Override
	public ApiResponse getMyProfile() {

		Authentication authentication =
				SecurityContextHolder.getContext().getAuthentication();

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();

		Customer customer = customerRepository.findById(jwt.getUserId())
				.orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

		return new ApiResponse("success", mapToResponse(customer));
	}

	@Override
	public ApiResponse updateMyProfile(UpdateCustomerRequest request) {

		Authentication authentication =
				SecurityContextHolder.getContext().getAuthentication();

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();

		Customer customer = customerRepository.findById(jwt.getUserId())
				.orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

		customer.setFirstName(request.getFirstName());
		customer.setMiddleName(request.getMiddleName());
		customer.setLastName(request.getLastName());
		customer.setMobile(request.getMobile());
		customer.setAddress(request.getAddress());

		return new ApiResponse("success", mapToResponse(customer));
	}

	private CustomerResponse mapToResponse(Customer customer) {

		CustomerResponse response = modelMapper.map(customer, CustomerResponse.class);
		response.setEmail(customer.getUser().getEmail());

		return response;
	}

}
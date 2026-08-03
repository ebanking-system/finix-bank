package com.finix.customer.service;

import com.finix.auth.dto.ApiResponse;
import com.finix.customer.dto.UpdateCustomerRequest;

public interface CustomerService {

	ApiResponse getMyProfile();

	ApiResponse updateMyProfile(UpdateCustomerRequest request);

}
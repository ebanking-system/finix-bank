package com.finix.account.service;

import java.util.List;

import org.springframework.http.ResponseEntity;

import com.finix.account.dto.AccountResponse;
import com.finix.account.dto.CreateAccountRequest;
import com.finix.account.entity.AccountType;
import com.finix.auth.dto.ApiResponse;
import com.finix.customer.entity.Customer;

public interface AccountService {

    AccountResponse createAccount(AccountType accType , Customer customer);

    ApiResponse getAccountById(Long accountId);

    ApiResponse getAccountByNumber(String accountNumber);

    ApiResponse getAccountsByCustomer(Long customerId);

	ResponseEntity<?> getBalance(AccountType accountType);
}
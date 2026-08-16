package com.finix.account.service;

import org.springframework.http.ResponseEntity;

import com.finix.account.dto.AccountResponse;
import com.finix.account.dto.CreateAccountRequest;
import com.finix.account.dto.DepositRequestDTO;
import com.finix.account.dto.EmployeeDepositRequestDTO;
import com.finix.account.entity.AccountType;
import com.finix.auth.dto.ApiResponse;
import com.finix.customer.entity.Customer;

public interface AccountService {

    AccountResponse createAccount(AccountType accType , Customer customer);

    AccountResponse openAccountForCurrentCustomer(CreateAccountRequest request);

    ApiResponse getAccountById(Long accountId);

    ApiResponse getAccountByNumber(String accountNumber);

    ApiResponse getAccountsByCustomer(Long customerId);

	ResponseEntity<?> getBalance(AccountType accountType);

    ApiResponse depositSelf(DepositRequestDTO request);

    ApiResponse depositEmployee(EmployeeDepositRequestDTO request);
}
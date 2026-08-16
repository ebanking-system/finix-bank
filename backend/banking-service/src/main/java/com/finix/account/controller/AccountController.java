package com.finix.account.controller;

import com.finix.account.dto.AccountResponse;
import com.finix.account.dto.CreateAccountRequest;
import com.finix.account.dto.DepositRequestDTO;
import com.finix.account.dto.EmployeeDepositRequestDTO;
import com.finix.account.entity.AccountType;
import com.finix.account.service.AccountService;
import com.finix.auth.dto.ApiResponse;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    /**
     * Create New Bank Account for Authenticated Customer
     */
    @PostMapping
    public ResponseEntity<?> createAccount(
            @Valid @RequestBody CreateAccountRequest request) {

        AccountResponse response =
                accountService.openAccountForCurrentCustomer(request);

        return new ResponseEntity<>(new ApiResponse("SUCCESS", response), HttpStatus.CREATED);
    }

    /**
     * Self-Service Deposit / Add Funds (Customer)
     */
    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse> depositSelf(
            @Valid @RequestBody DepositRequestDTO request) {
        return ResponseEntity.ok(accountService.depositSelf(request));
    }

    /**
     * Teller / Staff-Assisted Deposit (Employee/Manager)
     */
    @PostMapping("/employee/deposit")
    public ResponseEntity<ApiResponse> depositEmployee(
            @Valid @RequestBody EmployeeDepositRequestDTO request) {
        return ResponseEntity.ok(accountService.depositEmployee(request));
    }
    
    @GetMapping("/{accountId}")
    public ResponseEntity<ApiResponse> getAccountById(
            @PathVariable Long accountId) {

        return ResponseEntity.ok(
                accountService.getAccountById(accountId));
    }

    @GetMapping("/number/{accountNumber}")
    public ResponseEntity<ApiResponse> getAccountByNumber(
            @PathVariable String accountNumber) {

        return ResponseEntity.ok(
                accountService.getAccountByNumber(accountNumber));
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse> getAccountsByCustomer(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                accountService.getAccountsByCustomer(customerId));
    }
    
    @GetMapping("/balance")
    public ResponseEntity<?> getAccountBalance(@RequestParam AccountType accountType){
    	return accountService.getBalance(accountType);
    }
}
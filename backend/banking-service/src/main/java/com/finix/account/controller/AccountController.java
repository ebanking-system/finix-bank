package com.finix.account.controller;

import com.finix.account.dto.AccountResponse;
import com.finix.account.dto.CreateAccountRequest;
import com.finix.account.entity.AccountType;
import com.finix.account.service.AccountService;
import com.finix.auth.dto.ApiResponse;

import jakarta.validation.Valid;

import java.util.List;

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
     * Create New Bank Account
     */
    @PostMapping
    public ResponseEntity<?> createAccount(
            @Valid @RequestBody AccountType accType) {

        AccountResponse response =
                accountService.createAccount(accType);
        if(response==null) {
        	return new ResponseEntity<>("KYC NOT APPROVED YET",HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(response, HttpStatus.CREATED);
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
    public ResponseEntity<?>getAccountBalance(@RequestParam AccountType accountType){
    	return accountService.getBalance(accountType);
    }
}
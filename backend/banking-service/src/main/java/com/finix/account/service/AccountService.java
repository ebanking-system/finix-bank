package com.finix.account.service;

import java.util.List;

import com.finix.account.dto.AccountResponse;
import com.finix.account.dto.CreateAccountRequest;
import com.finix.account.entity.AccountType;

public interface AccountService {

    AccountResponse createAccount(AccountType accType);

    AccountResponse getAccountById(Long accountId);

    AccountResponse getAccountByNumber(String accountNumber);

    List<AccountResponse> getAccountsByCustomer(Long customerId);
}
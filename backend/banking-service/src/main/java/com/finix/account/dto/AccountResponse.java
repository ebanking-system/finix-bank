package com.finix.account.dto;

import com.finix.account.entity.AccountStatus;
import com.finix.account.entity.AccountType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class AccountResponse {

    private Long accountId;

    private String accountNumber;

    private AccountType accountType;

    private BigDecimal balance;

    private String ifscCode;

    private AccountStatus status;

    private LocalDateTime createdDate;
}
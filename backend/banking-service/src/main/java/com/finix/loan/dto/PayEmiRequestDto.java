package com.finix.loan.dto;

import com.finix.account.entity.AccountType;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PayEmiRequestDto {

    @NotNull(message = "Account Type is required")
    private AccountType accountType;

}
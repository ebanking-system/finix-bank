package com.finix.account.dto;

import com.finix.account.entity.AccountType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAccountRequest {

//    @NotNull(message = "Customer Id is required")
//    private Long customerId;

    @NotNull(message = "Account type is required")
    private AccountType accountType;
}
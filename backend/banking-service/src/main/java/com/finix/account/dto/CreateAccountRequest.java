package com.finix.account.dto;

import java.math.BigDecimal;
import com.finix.account.entity.AccountType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateAccountRequest {

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    @DecimalMin(value = "0.00", message = "Initial deposit cannot be negative")
    @DecimalMax(value = "500000.00", message = "Initial deposit exceeds maximum allowed limit (₹5,00,000)")
    private BigDecimal initialDeposit;
}
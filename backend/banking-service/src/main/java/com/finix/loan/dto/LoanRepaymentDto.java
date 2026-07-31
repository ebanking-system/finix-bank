package com.finix.loan.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoanRepaymentDto {

    @NotNull(message = "Repayment amount is required")
    @Positive(message = "Repayment amount must be greater than zero")
    private BigDecimal amountPaid;

}
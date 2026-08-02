package com.finix.loan.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanRequestDto {

    @NotNull(message = "Loan type is required")
    private Long loanTypeId;

    @NotNull(message = "Loan amount is required")
    @Positive(message = "Loan amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Loan tenure is required")
    @Positive(message = "Loan tenure must be greater than zero")
    private Integer tenureMonths;

}
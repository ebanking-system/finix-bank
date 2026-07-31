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
public class LoanRequestDto {
	
    @NotNull(message = "Customer ID is required")
    private Integer customerId;

    @NotNull(message = "Loan Type ID is required")
    private Integer loanTypeId;

    @NotNull(message = "Loan amount is required")
    @Positive(message = "Loan amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Loan tenure is required")
    @Positive(message = "Loan tenure must be greater than zero")
    private Integer tenureMonths;
	
	
}

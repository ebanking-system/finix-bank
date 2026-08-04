package com.finix.loan.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanTypeRequestDto {

    @NotBlank
    private String loanName;

    @NotNull
    @Positive
    private BigDecimal interestRate;

    @NotNull
    @Positive
    private BigDecimal minAmount;

    @NotNull
    @Positive
    private BigDecimal maxAmount;

    @NotNull
    @Positive
    private Integer minTenureMonths;

    @NotNull
    @Positive
    private Integer maxTenureMonths;
}

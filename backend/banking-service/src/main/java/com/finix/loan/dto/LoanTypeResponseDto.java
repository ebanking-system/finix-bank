package com.finix.loan.dto;

import java.math.BigDecimal;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanTypeResponseDto {

    private Long loanTypeId;

    private String loanName;

    private BigDecimal interestRate;

    private BigDecimal minAmount;

    private BigDecimal maxAmount;

    private Integer minTenureMonths;

    private Integer maxTenureMonths;
}
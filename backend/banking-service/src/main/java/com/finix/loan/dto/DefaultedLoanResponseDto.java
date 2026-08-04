package com.finix.loan.dto;

import java.math.BigDecimal;

import com.finix.loan.entity.LoanStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DefaultedLoanResponseDto {

    private Long loanId;

    private Long customerId;

    private String customerName;

    private String mobile;

    private String loanType;

    private BigDecimal loanAmount;

    private BigDecimal remainingAmount;

    private Integer overdueEmis;

    private LoanStatus status;
}
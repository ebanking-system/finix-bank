package com.finix.loan.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.finix.loan.entity.LoanStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoanResponseDto {

    private Integer loanId;

    private Integer customerId;

    private String loanType;

    private BigDecimal amount;

    private BigDecimal emi;

    private Integer tenureMonths;

    private BigDecimal remainingAmount;

    private LoanStatus status;

    private LocalDateTime applicationDate;

    private LocalDateTime approvalDate;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

}
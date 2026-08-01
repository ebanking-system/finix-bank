package com.finix.loan.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.finix.loan.entity.LoanStatus;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanResponseDto {

    private Long loanId;
    
    private Long customerId;
    
    private String customerName;
    
    private String mobile;

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
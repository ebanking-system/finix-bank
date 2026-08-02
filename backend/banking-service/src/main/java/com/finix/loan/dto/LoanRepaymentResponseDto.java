package com.finix.loan.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.finix.loan.entity.RepaymentStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoanRepaymentResponseDto {

    private Long repaymentId;

    private Integer emiNumber;

    private LocalDateTime dueDate;

    private BigDecimal amountDue;

    private BigDecimal amountPaid;

    private LocalDateTime paymentDate;

    private RepaymentStatus status;

}
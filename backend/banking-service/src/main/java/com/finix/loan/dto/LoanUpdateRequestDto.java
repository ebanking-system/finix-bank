package com.finix.loan.dto;

import com.finix.loan.entity.LoanStatus;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanUpdateRequestDto {

    private Long loanTypeId;

    @Positive(message = "Loan amount must be positive")
    private BigDecimal amount;

    @Positive(message = "Tenure must be positive")
    private Integer tenureMonths;

    private LoanStatus status;

    private String rejectionReason;
}

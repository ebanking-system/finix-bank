package com.finix.loan.dto;

import com.finix.loan.entity.LoanStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoanApprovalDto {

    @NotNull(message = "Loan status is required")
    private LoanStatus status;

}
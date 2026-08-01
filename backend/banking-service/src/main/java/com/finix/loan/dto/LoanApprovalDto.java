package com.finix.loan.dto;

import com.finix.loan.entity.LoanStatus;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanApprovalDto {

    @NotNull(message = "Status is required")
    private LoanStatus status;

}
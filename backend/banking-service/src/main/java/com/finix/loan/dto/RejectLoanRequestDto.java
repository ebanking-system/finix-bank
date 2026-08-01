package com.finix.loan.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RejectLoanRequestDto {

    @NotBlank(message = "Rejection reason is required")
    private String rejectionReason;

}
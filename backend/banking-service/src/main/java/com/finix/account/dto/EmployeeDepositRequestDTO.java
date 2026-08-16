package com.finix.account.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDepositRequestDTO {

    @NotBlank(message = "Account number is mandatory")
    private String accountNumber;

    @NotNull(message = "Deposit amount is mandatory")
    @DecimalMin(value = "1.00", message = "Minimum deposit amount is ₹1.00")
    @DecimalMax(value = "1000000.00", message = "Maximum single teller deposit limit is ₹10,00,000.00")
    private BigDecimal amount;

    private String depositType; // CASH, CHEQUE, DEMAND_DRAFT

    private String referenceNumber; // Deposit slip or cheque number

    private String depositorName;

    private String remarks;
}

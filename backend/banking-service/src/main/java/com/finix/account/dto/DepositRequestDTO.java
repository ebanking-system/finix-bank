package com.finix.account.dto;

import java.math.BigDecimal;
import com.finix.account.entity.AccountType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DepositRequestDTO {

    private AccountType accountType;

    private String accountNumber;

    @NotNull(message = "Deposit amount is mandatory")
    @DecimalMin(value = "1.00", message = "Minimum deposit amount is ₹1.00")
    @DecimalMax(value = "500000.00", message = "Maximum self-service deposit limit per transaction is ₹5,00,000.00")
    private BigDecimal amount;

    private String paymentMethod; // UPI, NEFT, IMPS, DEBIT_CARD

    private String referenceNumber;

    private String remarks;
}

package com.finix.transaction.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.finix.transaction.entity.TransactionNature;
import com.finix.transaction.entity.TransactionStatus;
import com.finix.transaction.entity.TransactionType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetAllTransactionsDto {

    private String counterPartyName;

    private String counterPartyAccountNumber;

    // TRANSFER / DEPOSIT / WITHDRAWAL
    private TransactionType transactionType;

    // CREDIT / DEBIT
    private TransactionNature nature;

    private BigDecimal amount;

    private TransactionStatus transactionStatus;

    private String referenceNumber;

    private LocalDateTime transactionDateTime;

    private String remarks;

}
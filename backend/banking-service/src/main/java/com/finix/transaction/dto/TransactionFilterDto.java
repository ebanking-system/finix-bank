package com.finix.transaction.dto;

import java.time.LocalDate;

import com.finix.transaction.entity.TransactionNature;
import com.finix.transaction.entity.TransactionStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionFilterDto {

    private TransactionNature nature;

    private TransactionStatus status;

    private LocalDate fromDate;

    private LocalDate toDate;

}
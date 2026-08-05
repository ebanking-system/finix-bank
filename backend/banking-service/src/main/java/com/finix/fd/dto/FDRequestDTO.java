package com.finix.fd.dto;

import java.math.BigDecimal;
import java.text.DecimalFormat;

import com.finix.account.entity.AccountType;
import com.finix.fd.entity.Tenure;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FDRequestDTO {

    private AccountType accountType;

    private BigDecimal depositAmount;

    private Tenure tenure;
}

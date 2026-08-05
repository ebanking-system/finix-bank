package com.finix.fd.dto;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.LocalDateTime;

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
public class FDResponseDTO {
	
	private Long fdId;

    private AccountType accountType;

    private BigDecimal depositAmount;

    private Tenure tenureYears;
    
    private LocalDateTime startDate;
    
    private LocalDateTime maturityDate;
}

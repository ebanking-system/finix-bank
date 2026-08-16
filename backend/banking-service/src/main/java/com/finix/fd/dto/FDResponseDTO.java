package com.finix.fd.dto;

import java.math.BigDecimal;
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

    private String accountNumber;

    private Long customerId;

    private String customerName;

    private BigDecimal depositAmount;

    private double interestRate;

    private Tenure tenureYears;
    
    private LocalDateTime startDate;
    
    private LocalDateTime maturityDate;

    private BigDecimal maturityAmount;

    private com.finix.fd.entity.Status status;
}

package com.finix.transaction.dto;

import java.math.BigDecimal;

import com.finix.account.entity.AccountType;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
public class TransferTransactionDto {
	
		private AccountType accountType;
	   
	    private String toAccount;


	    private BigDecimal amount;

	  
	    private String referenceNumber;


	    private String remarks;

}

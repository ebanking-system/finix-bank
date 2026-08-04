package com.finix.kyc.dto;

import com.finix.account.entity.AccountType;
import com.finix.kyc.entity.Status;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
public class StatusDto {
	Status status;
	AccountType accountType;
}

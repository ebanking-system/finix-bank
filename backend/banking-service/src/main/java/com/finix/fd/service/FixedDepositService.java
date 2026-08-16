package com.finix.fd.service;

import org.springframework.http.ResponseEntity;

import com.finix.account.entity.AccountType;
import com.finix.fd.dto.FDRequestDTO;

public interface FixedDepositService {

	ResponseEntity<?> createFD(FDRequestDTO request);

	ResponseEntity<?> getFDDetails(AccountType accountType);

	ResponseEntity<?> getAllFDs();
}

package com.finix.transaction.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finix.transaction.dto.TransactionDto;

@Service
@Transactional
public interface TransactionService {

	ResponseEntity<?> transferMoney(TransactionDto transactionDto);
	
}

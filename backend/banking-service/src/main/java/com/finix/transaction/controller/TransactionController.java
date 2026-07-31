package com.finix.transaction.controller;

import java.net.ResponseCache;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finix.transaction.dto.TransactionDto;
import com.finix.transaction.service.TransactionService;

import lombok.RequiredArgsConstructor;

@RequestMapping("api/transaction")
@RestController
@RequiredArgsConstructor
public class TransactionController {
	
	private final TransactionService transactionSerive;
	
	@PostMapping()
	public ResponseEntity<?> transferMoney(@RequestBody TransactionDto transactionDto){
		return transactionSerive.transferMoney(transactionDto);
	}
}

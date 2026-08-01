package com.finix.transaction.controller;

import java.net.ResponseCache;
import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.finix.transaction.dto.GetAllTransactionsDto;
import com.finix.transaction.dto.TransferTransactionDto;
import com.finix.transaction.entity.TransactionNature;
import com.finix.transaction.entity.TransactionStatus;
import com.finix.transaction.service.TransactionService;

import lombok.RequiredArgsConstructor;

@RequestMapping("api/transaction")
@RestController
@RequiredArgsConstructor
public class TransactionController {
	
	private final TransactionService transactionService;
	
	@PostMapping()
	public ResponseEntity<?> transferMoney(@RequestBody TransferTransactionDto transactionDto){
		return transactionService.transferMoney(transactionDto);
	}

	
	@GetMapping
	public ResponseEntity<Page<GetAllTransactionsDto>> getTransactions(

	        @RequestParam(defaultValue = "0")
	        int page,

	        @RequestParam(defaultValue = "10")
	        int size,

	        @RequestParam(defaultValue = "transactionDateTime")
	        String sortBy,

	        @RequestParam(defaultValue = "desc")
	        String direction,

	        @RequestParam(required = false)
	        TransactionNature nature,

	        @RequestParam(required = false)
	        TransactionStatus status,

	        @RequestParam(required = false)
	        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	        LocalDate fromDate,

	        @RequestParam(required = false)
	        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	        LocalDate toDate

	) {

	    return ResponseEntity.ok(transactionService.getTransactions(page, size,sortBy,direction,nature,status,fromDate,toDate));

	}
}

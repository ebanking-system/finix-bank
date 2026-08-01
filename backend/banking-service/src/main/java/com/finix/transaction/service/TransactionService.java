package com.finix.transaction.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finix.transaction.dto.GetAllTransactionsDto;
import com.finix.transaction.dto.TransferTransactionDto;
import com.finix.transaction.entity.TransactionNature;
import com.finix.transaction.entity.TransactionStatus;

@Service
@Transactional
public interface TransactionService {

	ResponseEntity<?> transferMoney(TransferTransactionDto transactionDto);


	Page<GetAllTransactionsDto> getTransactions(int page, int size, String sortBy, String direction,
			TransactionNature nature, TransactionStatus status, LocalDate fromDate, LocalDate toDate);
	
}

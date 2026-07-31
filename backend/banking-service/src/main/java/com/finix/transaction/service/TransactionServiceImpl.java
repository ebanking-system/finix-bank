package com.finix.transaction.service;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finix.account.entity.Account;
import com.finix.account.repository.AccountRepository;
import com.finix.customer.entity.Customer;
import com.finix.customer.repository.CustomerRepository;
import com.finix.security.CustomUserDetailsImpl;
import com.finix.security.CustomUserDetailsServiceImpl;
import com.finix.transaction.dto.TransactionDto;
import com.finix.transaction.entity.Transaction;
import com.finix.transaction.entity.TransactionStatus;
import com.finix.transaction.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;


@Service
@Transactional
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService{


	private final TransactionRepository transactionRepository;
	private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
	
	@Override
	public ResponseEntity<?> transferMoney(TransactionDto transactionDto) {
		// TODO Auto-generated method stub
		Authentication authentication=SecurityContextHolder.getContext().getAuthentication();
		
		CustomUserDetailsImpl user=(CustomUserDetailsImpl) authentication.getPrincipal();
		Customer customer=customerRepository.findById(user.getUserId()).orElseThrow();
		
		Account toAccount=accountRepository.findByAccountNumber(transactionDto.getToAccount()).orElseThrow();
		Account fromAccount=accountRepository.findByAccountNumber(customer.getCustomerId()).orElseThrow();
		
		Transaction tx=new Transaction();
		if(toAccount.getAccountId()==null) {
//			transactionRepository.findByFromAccount(fromAccount).setStatus(TransactionStatus.FAILED);
//			transactionRepository.findByFromAccount(toAccount).setStatus(TransactionStatus.FAILED);
			tx.setAmount(transactionDto.getAmount());
			tx.setFromAccount(fromAccount);
			tx.setToAccount(toAccount);
			tx.setReferenceNumber(null);
			tx.setStatus(TransactionStatus.FAILED);
			tx.setTransactionType(null);
			return ResponseEntity.badRequest().body(" Reciever Account not found");
		}
		
		if(transactionDto.getAmount().compareTo( toAccount.getBalance())>0) {
//			transactionRepository.findByFromAccount(fromAccount).setStatus(TransactionStatus.FAILED);
//			transactionRepository.findByFromAccount(toAccount).setStatus(TransactionStatus.FAILED);
			return ResponseEntity.badRequest().body("UNSUFFICIENT BALANCE");
		}
		
		toAccount.setBalance(toAccount.getBalance().subtract(transactionDto.getAmount()));
		fromAccount.setBalance(fromAccount.getBalance().add(transactionDto.getAmount()));
//		transactionRepository.findByFromAccount(fromAccount).setStatus(TransactionStatus.SUCCESS);
//		transactionRepository.findByFromAccount(toAccount).setStatus(TransactionStatus.SUCCESS);
		
		
		return null;
	}

}

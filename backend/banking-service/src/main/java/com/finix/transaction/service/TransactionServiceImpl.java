package com.finix.transaction.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finix.account.entity.Account;
import com.finix.account.entity.AccountStatus;
import com.finix.account.entity.AccountType;
import com.finix.account.repository.AccountRepository;
import com.finix.common.exception.BusinessException;
import com.finix.customer.entity.Customer;
import com.finix.customer.repository.CustomerRepository;
import com.finix.security.CustomUserDetailsImpl;
import com.finix.security.CustomUserDetailsServiceImpl;
import com.finix.transaction.dto.GetAllTransactionsDto;
import com.finix.transaction.dto.TransferTransactionDto;
import com.finix.transaction.entity.Transaction;
import com.finix.transaction.entity.TransactionNature;
import com.finix.transaction.entity.TransactionStatus;
import com.finix.transaction.entity.TransactionType;
import com.finix.transaction.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;


@Service
@Transactional
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService{

    private final ModelMapper modelMapper;


	private final TransactionRepository transactionRepository;
	private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;

    
	
    @Override
    public ResponseEntity<?> transferMoney(TransferTransactionDto transactionDto) {
    	try {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        CustomUserDetailsImpl user =
                (CustomUserDetailsImpl) authentication.getPrincipal();

        Customer customer = customerRepository
                .findById(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Account fromAccount = accountRepository
                .findByCustomerAndAccountType(customer,transactionDto.getAccountType());

        // Receiver account
        Optional<Account> receiverAccount =
                accountRepository.findByAccountNumber(transactionDto.getToAccount());

        if (receiverAccount.isEmpty()) {

            saveTransaction(
                    fromAccount,
                    null,
                    transactionDto,
                    TransactionStatus.FAILED,
                    "Receiver account not found");


            throw new BusinessException("Receiver account not found");
        }

        Account toAccount = receiverAccount.get();

        // Same account validation
        if (fromAccount.getAccountNumber()
                .equals(toAccount.getAccountNumber())) {

            saveTransaction(
                    fromAccount,
                    toAccount,
                    transactionDto,
                    TransactionStatus.FAILED,
                    "Cannot transfer to same account");

            

            throw new BusinessException("Cannot transfer to same account");
        }

        // Sender account active
        if (fromAccount.getStatus() != AccountStatus.ACTIVE) {

            saveTransaction(
                    fromAccount,
                    toAccount,
                    transactionDto,
                    TransactionStatus.FAILED,
                    "Sender account is inactive");
            throw new BusinessException("Sender account is inactive.");

       
        }

        // Receiver account active
        if (toAccount.getStatus() != AccountStatus.ACTIVE) {

            saveTransaction(
                    fromAccount,
                    toAccount,
                    transactionDto,
                    TransactionStatus.FAILED,
                    "Receiver account is inactive");
            throw new BusinessException("Receiver account is inactive.");
            
        }

        // Amount validation
        if (transactionDto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {

            saveTransaction(
                    fromAccount,
                    toAccount,
                    transactionDto,
                    TransactionStatus.FAILED,
                    "Invalid transfer amount");
            throw new BusinessException("Amount should be greater than zero.");
            
        }

        // Balance validation
        if (transactionDto.getAmount()
                .compareTo(fromAccount.getBalance()) > 0) {

            saveTransaction(
                    fromAccount,
                    toAccount,
                    transactionDto,
                    TransactionStatus.FAILED,
                    "Insufficient balance");

            throw new BusinessException("Insufficient Balance");
        }

        // Debit sender
        fromAccount.setBalance(
                fromAccount.getBalance()
                        .subtract(transactionDto.getAmount()));

        // Credit receiver
        toAccount.setBalance(
                toAccount.getBalance()
                        .add(transactionDto.getAmount()));

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        saveTransaction(
                fromAccount,
                toAccount,
                transactionDto,
                TransactionStatus.SUCCESS,
                "Money transferred successfully");
    	}catch(Exception ex) {
    		throw ex;
    	}

        return ResponseEntity.ok("Money transferred successfully.");
    }
    
    
    private void saveTransaction(Account fromAccount,
            Account toAccount,
            TransferTransactionDto transactionDto,
            TransactionStatus status,
            String remarks) {

			Transaction transaction = new Transaction();
			
			transaction.setFromAccount(fromAccount);
			transaction.setToAccount(toAccount);
			transaction.setAmount(transactionDto.getAmount());
			transaction.setTransactionType(TransactionType.TRANSFER);
			transaction.setReferenceNumber(UUID.randomUUID().toString());//universally unique identifier (UUID
			transaction.setStatus(status);
			transaction.setRemarks(remarks);
			
			transactionRepository.save(transaction);
}

    @Override
    public Page<GetAllTransactionsDto> getTransactions(
            int page,
            int size,
            String sortBy,
            String direction,
            TransactionNature nature,
            TransactionStatus status,
            LocalDate fromDate,
            LocalDate toDate) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        CustomUserDetailsImpl user =
                (CustomUserDetailsImpl) authentication.getPrincipal();

        Customer customer =
                customerRepository.findById(user.getUserId())
                        .orElseThrow(() ->
                                new RuntimeException("Customer not found"));

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable =
                PageRequest.of(page, size, sort);

        LocalDateTime startDate = null;
        LocalDateTime endDate = null;

        if (fromDate != null) {
            startDate = fromDate.atStartOfDay();
        }

        if (toDate != null) {
            endDate = toDate.atTime(23, 59, 59);
        }

        Page<Transaction> transactionPage =
                transactionRepository.findTransactions(
                        customer,
                        status,
                        nature,
                        startDate,
                        endDate,
                        pageable);

        return transactionPage.map(tx -> {

            GetAllTransactionsDto dto =
                    new GetAllTransactionsDto();

            dto.setAmount(tx.getAmount());

            dto.setReferenceNumber(tx.getReferenceNumber());

            dto.setRemarks(tx.getRemarks());

            dto.setTransactionStatus(tx.getStatus());

            dto.setTransactionDateTime(tx.getTransactionDateTime());

            dto.setTransactionType(tx.getTransactionType());

            /*
             * Determine CREDIT / DEBIT
             */
            if (tx.getFromAccount() != null &&
                    tx.getFromAccount().getCustomer().equals(customer)) {

                dto.setNature(TransactionNature.DEBIT);

                if (tx.getToAccount() != null) {

                    dto.setCounterPartyName(
                            tx.getToAccount()
                                    .getCustomer()
                                    .getFirstName());

                    dto.setCounterPartyAccountNumber(
                            tx.getToAccount()
                                    .getAccountNumber());

                } else {

                    dto.setCounterPartyName("Cash Withdrawal");
                    dto.setCounterPartyAccountNumber("-");

                }

            } else {

                dto.setNature(TransactionNature.CREDIT);

                if (tx.getFromAccount() != null) {

                    dto.setCounterPartyName(
                            tx.getFromAccount()
                                    .getCustomer()
                                    .getFirstName());

                    dto.setCounterPartyAccountNumber(
                            tx.getFromAccount()
                                    .getAccountNumber());

                } else {

                    dto.setCounterPartyName("Cash Deposit");
                    dto.setCounterPartyAccountNumber("-");

                }

            }

            return dto;

        });

    }

}

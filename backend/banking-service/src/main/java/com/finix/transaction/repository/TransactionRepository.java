package com.finix.transaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.finix.account.entity.Account;
import com.finix.customer.entity.Customer;
import com.finix.transaction.entity.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

	Transaction findByFromAccount(Customer fromAccount);

	Transaction findByFromAccount(Account toAccount);

}

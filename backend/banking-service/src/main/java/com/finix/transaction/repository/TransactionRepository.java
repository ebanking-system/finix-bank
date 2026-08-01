package com.finix.transaction.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.finix.account.entity.Account;
import com.finix.customer.entity.Customer;
import com.finix.transaction.entity.Transaction;
import com.finix.customer.entity.Customer;
import com.finix.transaction.entity.Transaction;
import com.finix.transaction.entity.TransactionNature;
import com.finix.transaction.entity.TransactionStatus;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>,JpaSpecificationExecutor<Transaction> {

	Transaction findByFromAccount(Customer fromAccount);

//	List<Transaction> findByFromAccount(Account toAccount);
//
//	List<Transaction> findByToAccount(Account fromAccountSaving);
	
	List<Transaction> findByFromAccountCustomerOrToAccountCustomer(Customer fromCustomer,Customer toCustomer);

	@Query("""
			SELECT t
			FROM Transaction t
			WHERE
			(
			    t.fromAccount.customer = :customer
			    OR
			    t.toAccount.customer = :customer
			)

			AND
			(
			    :status IS NULL
			    OR t.status = :status
			)

			AND
			(
			    :fromDate IS NULL
			    OR t.transactionDateTime >= :fromDate
			)

			AND
			(
			    :toDate IS NULL
			    OR t.transactionDateTime <= :toDate
			)

			AND
			(
			    (:isDebit = false AND :isCredit = false)

			    OR

			    (:isDebit = true
			        AND t.fromAccount.customer = :customer)

			    OR

			    (:isCredit = true
			        AND t.toAccount.customer = :customer)
			)
			""")
			Page<Transaction> findTransactions(

			        Customer customer,

			        TransactionStatus status,

			        Boolean isDebit,

			        Boolean isCredit,

			        LocalDateTime fromDate,

			        LocalDateTime toDate,

			        Pageable pageable
			);
}

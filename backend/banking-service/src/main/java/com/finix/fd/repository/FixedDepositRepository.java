package com.finix.fd.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.finix.account.entity.Account;
import com.finix.customer.entity.Customer;
import com.finix.fd.entity.FixedDeposits;

public interface FixedDepositRepository extends JpaRepository<FixedDeposits, Long> {

//	List<FixedDeposits> findByCustomer(Customer customer);

//	List<FixedDeposits> findByCustomer_CustomerId(Long customerId);

	List<FixedDeposits> findByAccount(Account account);

}

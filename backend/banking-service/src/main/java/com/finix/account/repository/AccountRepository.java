package com.finix.account.repository;

import com.finix.account.entity.Account;
import com.finix.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {

    // Check whether generated account number already exists
    boolean existsByAccountNumber(String accountNumber);

    // Find account using account number
    Optional<Account> findByAccountNumber(String accountNumber);

    // Get all accounts of a customer
    List<Account> findByCustomer(Customer customer);
}
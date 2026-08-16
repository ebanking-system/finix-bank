package com.finix.account.repository;

import com.finix.account.entity.Account;
import com.finix.account.entity.AccountStatus;
import com.finix.account.entity.AccountType;
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

    Optional<Account> findByAccountIdAndAccountType(Long userId,AccountType accountType);

//	Optional<Account> findByAccountNumber(String customerId);

	Account findByCustomerAndAccountType(Customer customer, AccountType accountType);
	
	Account findByAccountTypeAndCustomer( AccountType accountType ,Customer customer);

    Optional<Account> findFirstByCustomerAndAccountTypeAndStatus(Customer customer, AccountType accountType, AccountStatus status);

    // Count accounts by customer, type, and status (e.g. ACTIVE)
    long countByCustomerAndAccountTypeAndStatus(Customer customer, AccountType accountType, AccountStatus status);
}
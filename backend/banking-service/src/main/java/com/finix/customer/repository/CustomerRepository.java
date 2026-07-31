package com.finix.customer.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.finix.auth.entity.User;
import com.finix.customer.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
	
}

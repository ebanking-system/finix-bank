package com.finix.loan.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.finix.customer.entity.Customer;
import com.finix.loan.entity.Loan;
import com.finix.loan.entity.LoanStatus;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
	
	List<Loan> findByCustomer(Customer customer);
	
	//This is for Employee Role whose designation is LoanOfficer and department Lone
	List<Loan> findByStatus(LoanStatus status);
}

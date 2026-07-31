package com.finix.loan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.finix.loan.entity.Loan;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Integer> {
	
}

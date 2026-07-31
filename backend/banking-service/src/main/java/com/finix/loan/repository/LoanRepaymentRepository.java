package com.finix.loan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.finix.loan.entity.LoanRepayment;

@Repository
public interface LoanRepaymentRepository extends JpaRepository<LoanRepayment, Integer>{

}

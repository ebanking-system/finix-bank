package com.finix.loan.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.finix.loan.entity.Loan;
import com.finix.loan.entity.LoanRepayment;
import com.finix.loan.entity.RepaymentStatus;

@Repository
public interface LoanRepaymentRepository extends JpaRepository<LoanRepayment, Long>{
	
	List<LoanRepayment> findByLoanOrderByEmiNumberAsc(Loan loan);
	
	List<LoanRepayment> findByLoanAndStatusOrderByEmiNumberAsc(Loan loan,RepaymentStatus status);
	
	List<LoanRepayment> findByStatusAndDueDateBefore(RepaymentStatus status,LocalDateTime dateTime);
	
	long countByLoanAndStatus(Loan loan,RepaymentStatus status);
	
}

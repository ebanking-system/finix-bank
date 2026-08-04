package com.finix.loan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;

import com.finix.loan.dto.LoanTypeRequestDto;
import com.finix.loan.entity.LoanType;

@Repository
public interface LoanTypeRepository extends JpaRepository<LoanType, Long>{
	

	boolean existsByLoanName(String loanName);

	boolean existsByLoanNameAndLoanTypeIdNot(String loanName, Long loanTypeId);
	
	
}

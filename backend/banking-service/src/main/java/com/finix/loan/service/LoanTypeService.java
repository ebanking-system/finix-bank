package com.finix.loan.service;


import org.springframework.http.ResponseEntity;

import com.finix.loan.dto.LoanTypeRequestDto;

public interface LoanTypeService  {

	ResponseEntity<?> createLoanType(LoanTypeRequestDto request);
	
	ResponseEntity<?> getAllLoanTypes();
	
	ResponseEntity<?> getLoanTypeById(Long loanTypeId);
	
	ResponseEntity<?> updateLoanType(
	        Long loanTypeId,
	        LoanTypeRequestDto request);
	
	ResponseEntity<?> deleteLoanType(Long loanTypeId);
}

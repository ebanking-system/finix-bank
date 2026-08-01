package com.finix.loan.service;

import org.springframework.http.ResponseEntity;

import com.finix.loan.dto.LoanRequestDto;
import com.finix.loan.dto.RejectLoanRequestDto;


public interface LoanService {

    ResponseEntity<?> applyLoan(LoanRequestDto request);
    
    ResponseEntity<?> getMyLoans();
    
    //For Employee to get all pending loans
    ResponseEntity<?> getPendingLoans();
    
    //Employee will check and approve loan
    ResponseEntity<?> approveLoan(Long loanId);
    
    //Loan will be rejected by Employee or manager
    ResponseEntity<?> rejectLoan(Long loanId,RejectLoanRequestDto request);
    
    //Loan dispurse to customer account
    ResponseEntity<?> disburseLoan(Long loanId);

}
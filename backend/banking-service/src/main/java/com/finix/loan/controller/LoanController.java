package com.finix.loan.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.finix.loan.dto.LoanRequestDto;
import com.finix.loan.dto.RejectLoanRequestDto;
import com.finix.loan.service.LoanService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
@Validated
public class LoanController {

    private final LoanService loanService;

    //For Customer to apply loan
    @PostMapping("/apply")
    public ResponseEntity<?> applyLoan(@Valid @RequestBody LoanRequestDto request) {

        return loanService.applyLoan(request);
    }
    
    //For Customer to get applied loans
    @GetMapping("/my-loans")
    public ResponseEntity<?> getMyLoans() {

        return loanService.getMyLoans();

    }
    
    //To get pending loans By Employees
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingLoans() {

        return loanService.getPendingLoans();

    }
    
    //To approve loans by Employees
    @PutMapping("/{loanId}/approve")
    public ResponseEntity<?> approveLoan(@PathVariable Long loanId) {
        return loanService.approveLoan(loanId);
    }
    
    //Loan will be rejection
    @PutMapping("/{loanId}/reject")
    public ResponseEntity<?> rejectLoan(
            @PathVariable Long loanId,
            @Valid @RequestBody RejectLoanRequestDto request) {

        return loanService.rejectLoan(loanId, request);

    }
    
    //To disburse loan to customers account
    @PutMapping("/{loanId}/disburse")
    public ResponseEntity<?> disburseLoan(@PathVariable Long loanId) {
        return loanService.disburseLoan(loanId);
    }
    
    
}
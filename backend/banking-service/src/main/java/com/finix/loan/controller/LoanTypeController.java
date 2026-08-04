package com.finix.loan.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.finix.loan.dto.LoanTypeRequestDto;
import com.finix.loan.service.LoanTypeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/loan-types")
@RequiredArgsConstructor
@Validated
public class LoanTypeController {

    private final LoanTypeService loanTypeService;

    @PostMapping
    public ResponseEntity<?> createLoanType(
            @Valid @RequestBody LoanTypeRequestDto request) {

        return loanTypeService.createLoanType(request);
    }
    
    @GetMapping
    public ResponseEntity<?> getAllLoanTypes() {

        return loanTypeService.getAllLoanTypes();
    }
    
    @GetMapping("/{loanTypeId}")
    public ResponseEntity<?> getLoanTypeById(
            @PathVariable Long loanTypeId) {

        return loanTypeService.getLoanTypeById(loanTypeId);
    }
    
    @PutMapping("/{loanTypeId}")
    public ResponseEntity<?> updateLoanType(
            @PathVariable Long loanTypeId,
            @Valid @RequestBody LoanTypeRequestDto request) {

        return loanTypeService.updateLoanType(
                loanTypeId,
                request);
    }
    
    @DeleteMapping("/{loanTypeId}")
    public ResponseEntity<?> deleteLoanType(
            @PathVariable Long loanTypeId) {

        return loanTypeService.deleteLoanType(loanTypeId);
    }
}
package com.finix.loan.service;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.JwtDTO;
import com.finix.loan.dto.LoanTypeRequestDto;
import com.finix.loan.dto.LoanTypeResponseDto;
import com.finix.loan.entity.LoanType;
import com.finix.loan.repository.LoanTypeRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class LoanTypeServiceImpl implements LoanTypeService {

    private final LoanTypeRepository loanTypeRepository;

    private final ModelMapper mapper;

    @Override
    public ResponseEntity<?> createLoanType(LoanTypeRequestDto request) {

		
        // Duplicate Loan Name
        if (loanTypeRepository.existsByLoanName(request.getLoanName())) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "Loan type already exists."));
        }

        // Amount Validation
        if (request.getMinAmount().compareTo(request.getMaxAmount()) >= 0) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "Minimum amount must be less than maximum amount."));
        }

        // Tenure Validation
        if (request.getMinTenureMonths() >= request.getMaxTenureMonths()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "Minimum tenure must be less than maximum tenure."));
        }

        // DTO -> Entity
        LoanType loanType = mapper.map(request, LoanType.class);

        // Save

        LoanType savedLoanType = loanTypeRepository.save(loanType);

        return ResponseEntity.ok(
                new ApiResponse(
                        "SUCCESS",
                        "Loan type '" + savedLoanType.getLoanName() + "' created successfully."));
    }

    @Override
    public ResponseEntity<?> getAllLoanTypes() {

        List<LoanType> loanTypes = loanTypeRepository.findAll();

        List<LoanTypeResponseDto> response = loanTypes.stream()
                .map(loanType -> mapper.map(loanType, LoanTypeResponseDto.class))
                .toList();

        return ResponseEntity.ok(response);
    }
    
    @Override
    public ResponseEntity<?> getLoanTypeById(Long loanTypeId) {

        LoanType loanType = loanTypeRepository.findById(loanTypeId)
                .orElseThrow(() ->
                        new RuntimeException("Loan type not found."));

        LoanTypeResponseDto response =
                mapper.map(loanType, LoanTypeResponseDto.class);

        return ResponseEntity.ok(response);
    }
    
    @Override
    public ResponseEntity<?> updateLoanType(
            Long loanTypeId,
            LoanTypeRequestDto request) {

        LoanType loanType =
                loanTypeRepository.findById(loanTypeId)
                        .orElseThrow(() ->
                                new RuntimeException("Loan type not found."));

        // Duplicate Loan Name
        if (loanTypeRepository.existsByLoanNameAndLoanTypeIdNot(
                request.getLoanName(),
                loanTypeId)) {

            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "Loan type already exists."));
        }

        // Amount Validation
        if (request.getMinAmount()
                .compareTo(request.getMaxAmount()) >= 0) {

            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "Minimum amount must be less than maximum amount."));
        }

        // Tenure Validation
        if (request.getMinTenureMonths()
                >= request.getMaxTenureMonths()) {

            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "Minimum tenure must be less than maximum tenure."));
        }

        // DTO -> Existing Entity
        mapper.map(request, loanType);

        loanTypeRepository.save(loanType);

        return ResponseEntity.ok(
                new ApiResponse(
                        "SUCCESS",
                        "Loan type updated successfully."));
    }
    
    @Override
    public ResponseEntity<?> deleteLoanType(Long loanTypeId) {

        LoanType loanType = loanTypeRepository.findById(loanTypeId)
                .orElseThrow(() ->
                        new RuntimeException("Loan type not found."));

        // Check if this loan type is already used
        if (loanTypeRepository.existsByLoanType(loanType)) {

            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "Loan type cannot be deleted because it is used by existing loans."));
        }

        loanTypeRepository.delete(loanType);

        return ResponseEntity.ok(
                new ApiResponse(
                        "SUCCESS",
                        "Loan type deleted successfully."));
    }
}
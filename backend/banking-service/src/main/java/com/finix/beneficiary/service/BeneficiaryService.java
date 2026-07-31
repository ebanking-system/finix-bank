package com.finix.beneficiary.service;

import org.springframework.http.ResponseEntity;

import com.finix.beneficiary.dto.BeneficiaryDTO;

public interface BeneficiaryService {

	ResponseEntity<?> addBeneficiary(BeneficiaryDTO dto);

	ResponseEntity<?> deleteBeneficiary(Long id);

	ResponseEntity<?> getAllBeneficiaries();

	ResponseEntity<?> updateBeneficiary(Long id, String name);

}

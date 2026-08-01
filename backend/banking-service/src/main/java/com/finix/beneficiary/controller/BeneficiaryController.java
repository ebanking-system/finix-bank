	package com.finix.beneficiary.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.finix.beneficiary.dto.BeneficiaryDTO;
import com.finix.beneficiary.service.BeneficiaryService;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequestMapping("api/beneficiary")
@RestController
@RequiredArgsConstructor
public class BeneficiaryController {
	private BeneficiaryService beneficiaryService;
	
	@PostMapping("/add")
	public ResponseEntity<?> addBeneficiary(@RequestBody BeneficiaryDTO beneficiaryDto){
		return beneficiaryService.addBeneficiary(beneficiaryDto);
	}
	
	@DeleteMapping
	public ResponseEntity<?> deleteBeneficiary(@PathVariable Long id){
		return beneficiaryService.deleteBeneficiary(id);
	}
	
	@GetMapping
	public ResponseEntity<?> getAllBeneficiaries(){
		return beneficiaryService.getAllBeneficiaries();
	}
	@PatchMapping
	public ResponseEntity<?> updateBeneficiary(@PathVariable Long id,@RequestParam String name){
		return beneficiaryService.updateBeneficiary(id,name);
	}
}

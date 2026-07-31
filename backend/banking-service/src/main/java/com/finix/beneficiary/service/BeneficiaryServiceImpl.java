package com.finix.beneficiary.service;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finix.auth.dto.ApiResponse;
import com.finix.auth.entity.User;
import com.finix.auth.repository.UserRepository;
import com.finix.beneficiary.dto.BeneficiaryDTO;
import com.finix.beneficiary.entity.Beneficiary;
import com.finix.beneficiary.repository.BeneficiaryRepository;
import com.finix.customer.entity.Customer;
import com.finix.customer.repository.CustomerRepository;
import com.finix.security.CustomUserDetailsImpl;

import lombok.RequiredArgsConstructor;
@Service
@Transactional
@RequiredArgsConstructor
public class BeneficiaryServiceImpl implements BeneficiaryService {
	private final BeneficiaryRepository beneficiaryRepository;
	private final CustomerRepository customerRepository;
	private final ModelMapper modelMapper;
	@Override
	public ResponseEntity<?> addBeneficiary(BeneficiaryDTO dto) {
		
		Authentication authentication =
    	        SecurityContextHolder.getContext().getAuthentication();

    	CustomUserDetailsImpl user =
    	        (CustomUserDetailsImpl) authentication.getPrincipal();

    	Customer customer = customerRepository.findById(user.getUserId()).orElseThrow(()->new RuntimeException("Customer not found"));
		
		Beneficiary entity=modelMapper.map(dto,Beneficiary.class);
		entity.setCustomer(customer);
		// TODO Auto-generated method stub
		try {
			beneficiaryRepository.save(entity);
			return ResponseEntity.ok("Saved Successfully");
		}catch(RuntimeException ex) {
			return ResponseEntity.badRequest().body(ex.getMessage());
		}
		
	}
	@Override
	public ResponseEntity<?> deleteBeneficiary(Long id) {
		// TODO Auto-generated method stub
		try {
			beneficiaryRepository.deleteById(id);
		}catch(RuntimeException ex) {
			return ResponseEntity.badRequest().body("ERROR : "+ex.getMessage());
		}
		return ResponseEntity.noContent().build();
	}
	@Override
	public ResponseEntity<?> getAllBeneficiaries() {
		// TODO Auto-generated method stub
		List<Beneficiary> resultList= beneficiaryRepository.findAll();
		if(resultList.isEmpty()) {
			return ResponseEntity.noContent().build();
		}
		return ResponseEntity.ok(resultList);
	}
	@Override
	public ResponseEntity<?> updateBeneficiary(Long id,String name) {
		// TODO Auto-generated method stub
		Beneficiary entity = beneficiaryRepository.findById(id).orElseThrow();
		if(entity ==null) {
			return ResponseEntity.badRequest().body("Beneficiary not found");
		}
		entity.setBeneficiaryName(name);
		return ResponseEntity.ok("Updation Successfull..!");
	}
	
}

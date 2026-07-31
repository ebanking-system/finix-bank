package com.finix.beneficiary.service;

import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.finix.auth.dto.ApiResponse;
import com.finix.auth.entity.User;
import com.finix.auth.repository.UserRepository;
import com.finix.beneficiary.dto.BeneficiaryDTO;
import com.finix.beneficiary.entity.Beneficiary;
import com.finix.beneficiary.repository.BeneficiaryRepository;
import com.finix.customer.entity.Customer;
import com.finix.customer.repository.CustomerRepository;
import com.finix.security.CustomUserDetailsImpl;

public class BeneficiaryServiceImpl implements BeneficiaryService {
	private BeneficiaryRepository beneficiaryRepository;
	private CustomerRepository customerRepository;
	private ModelMapper modelMapper;
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
		beneficiaryRepository.deleteById(id);;
		return null;
	}

}

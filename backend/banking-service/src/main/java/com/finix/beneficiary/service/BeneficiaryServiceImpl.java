package com.finix.beneficiary.service;

import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finix.account.repository.AccountRepository;
import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.JwtDTO;
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

    private final PasswordEncoder passwordEncoder;
	private final BeneficiaryRepository beneficiaryRepository;
	private final CustomerRepository customerRepository;
	private final AccountRepository accountRepository;
	private final ModelMapper modelMapper;

	@Override
	public ResponseEntity<?> addBeneficiary(BeneficiaryDTO dto) {
		
		Authentication authentication =
    	        SecurityContextHolder.getContext().getAuthentication();
    	
    	JwtDTO jwt =
        		(JwtDTO) authentication.getPrincipal();

    	Customer customer = customerRepository.findById(jwt.getUserId()).orElseThrow(()->new RuntimeException("Customer not found"));
		if(!accountRepository.existsByAccountNumber(dto.getAccountNumber())) {
			return ResponseEntity.badRequest().body(new ApiResponse("Failure","Beneficiary Account not found"));
		}
		Beneficiary entity=modelMapper.map(dto,Beneficiary.class);
		entity.setCustomer(customer);
		try {
			beneficiaryRepository.save(entity);
			return ResponseEntity.ok(new ApiResponse("success","Saved Successfully"));
		}catch(RuntimeException ex) {
			return ResponseEntity.badRequest().body(new ApiResponse("failure",ex.getMessage()));
		}
	}

	@Override
	public ResponseEntity<?> deleteBeneficiary(Long id) {
		Authentication authentication =
    	        SecurityContextHolder.getContext().getAuthentication();
    	
    	JwtDTO jwt =
        		(JwtDTO) authentication.getPrincipal();

    	Customer customer = customerRepository.findById(jwt.getUserId()).orElseThrow(()->new RuntimeException("Customer not found"));
		Beneficiary entity = beneficiaryRepository.findById(id).orElseThrow(() -> new RuntimeException("Beneficiary not found"));
		
		if(!customer.getCustomerId().equals(entity.getCustomer().getCustomerId())) {
			return ResponseEntity.badRequest().body(new ApiResponse("failure","Unauthorized to delete this beneficiary"));
		}

		try {
			beneficiaryRepository.deleteById(id);
		}catch(RuntimeException ex) {
			return ResponseEntity.badRequest().body("ERROR : "+ex.getMessage());
		}
		return ResponseEntity.noContent().build();
	}

	@Override
	public ResponseEntity<?> getAllBeneficiaries() {
		Authentication authentication =
    	        SecurityContextHolder.getContext().getAuthentication();
    	
    	JwtDTO jwt =
        		(JwtDTO) authentication.getPrincipal();

    	Customer customer = customerRepository.findById(jwt.getUserId()).orElseThrow(()->new RuntimeException("Customer not found"));
		List<Beneficiary> resultList = beneficiaryRepository.findByCustomer(customer);

		List<BeneficiaryDTO> resp = new ArrayList<>();
		for(Beneficiary b : resultList) {
			BeneficiaryDTO dto = modelMapper.map(b, BeneficiaryDTO.class);
			dto.setBeneficiaryId(b.getBeneficiaryId());
			resp.add(dto);
		}
		
		if(resp.isEmpty()) {
			return ResponseEntity.noContent().build();
		}
		return ResponseEntity.ok(new ApiResponse("success", resp));
	}

	@Override
	public ResponseEntity<?> updateBeneficiary(Long id,String name) {
		Authentication authentication =
    	        SecurityContextHolder.getContext().getAuthentication();
    	
    	JwtDTO jwt =
        		(JwtDTO) authentication.getPrincipal();

    	Customer customer = customerRepository.findById(jwt.getUserId()).orElseThrow(()->new RuntimeException("Customer not found"));
		Beneficiary entity = beneficiaryRepository.findById(id).orElseThrow(() -> new RuntimeException("Beneficiary not found"));
		
		if(!customer.getCustomerId().equals(entity.getCustomer().getCustomerId())) {
			return ResponseEntity.badRequest().body(new ApiResponse("failure","Beneficiary not found"));
		}
		entity.setBeneficiaryName(name);
		return ResponseEntity.ok(new ApiResponse("success","Updation Successful..!"));
	}
}

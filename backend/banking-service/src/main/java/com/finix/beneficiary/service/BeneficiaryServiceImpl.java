package com.finix.beneficiary.service;

import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finix.account.repository.AccountRepository;
import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.JwtDTO;
import com.finix.beneficiary.dto.BeneficiaryDTO;
import com.finix.beneficiary.entity.Beneficiary;
import com.finix.beneficiary.repository.BeneficiaryRepository;
import com.finix.common.exception.BusinessException;
import com.finix.common.exception.ResourceNotFoundException;
import com.finix.customer.entity.Customer;
import com.finix.customer.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class BeneficiaryServiceImpl implements BeneficiaryService {

	private final BeneficiaryRepository beneficiaryRepository;
	private final CustomerRepository customerRepository;
	private final AccountRepository accountRepository;
	private final ModelMapper modelMapper;

	@Override
	public ResponseEntity<?> addBeneficiary(BeneficiaryDTO dto) {
		if (dto == null || dto.getBeneficiaryName() == null || dto.getBeneficiaryName().isBlank()) {
			throw new BusinessException("Beneficiary name is mandatory.");
		}

		if (dto.getAccountNumber() == null || !dto.getAccountNumber().matches("^[0-9]{9,18}$")) {
			throw new BusinessException("Account number must be between 9 and 18 numeric digits.");
		}

		if (dto.getIfscCode() == null || dto.getIfscCode().isBlank()) {
			throw new BusinessException("IFSC code is mandatory.");
		}

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
			throw new BusinessException("User is unauthenticated.");
		}

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
		Customer customer = customerRepository.findById(jwt.getUserId())
				.orElseThrow(() -> new ResourceNotFoundException("Customer profile not found."));

		Beneficiary entity = new Beneficiary();
		entity.setCustomer(customer);
		entity.setBeneficiaryName(dto.getBeneficiaryName().trim());
		entity.setAccountNumber(dto.getAccountNumber().trim());
		entity.setIfscCode(dto.getIfscCode().trim().toUpperCase());

		Beneficiary saved = beneficiaryRepository.save(entity);
		BeneficiaryDTO responseDto = modelMapper.map(saved, BeneficiaryDTO.class);
		responseDto.setBeneficiaryId(saved.getBeneficiaryId());

		return ResponseEntity.ok(new ApiResponse("success", responseDto));
	}

	@Override
	public ResponseEntity<?> deleteBeneficiary(Long id) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
			throw new BusinessException("User is unauthenticated.");
		}

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
		Customer customer = customerRepository.findById(jwt.getUserId())
				.orElseThrow(() -> new ResourceNotFoundException("Customer profile not found."));

		Beneficiary entity = beneficiaryRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Beneficiary #" + id + " not found."));

		if (!customer.getCustomerId().equals(entity.getCustomer().getCustomerId())) {
			return ResponseEntity.badRequest().body(new ApiResponse("failure", "Unauthorized to delete this beneficiary."));
		}

		beneficiaryRepository.deleteById(id);
		return ResponseEntity.ok(new ApiResponse("success", "Beneficiary removed successfully."));
	}

	@Override
	public ResponseEntity<?> getAllBeneficiaries() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
			return ResponseEntity.ok(new ApiResponse("success", new ArrayList<>()));
		}

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
		Customer customer = customerRepository.findById(jwt.getUserId()).orElse(null);
		if (customer == null) {
			return ResponseEntity.ok(new ApiResponse("success", new ArrayList<>()));
		}

		List<Beneficiary> resultList = beneficiaryRepository.findByCustomer(customer);
		List<BeneficiaryDTO> resp = new ArrayList<>();
		for (Beneficiary b : resultList) {
			BeneficiaryDTO dto = modelMapper.map(b, BeneficiaryDTO.class);
			dto.setBeneficiaryId(b.getBeneficiaryId());
			resp.add(dto);
		}

		return ResponseEntity.ok(new ApiResponse("success", resp));
	}

	@Override
	public ResponseEntity<?> updateBeneficiary(Long id, String name) {
		if (name == null || name.isBlank()) {
			throw new BusinessException("Updated beneficiary name cannot be empty.");
		}

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
			throw new BusinessException("User is unauthenticated.");
		}

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
		Customer customer = customerRepository.findById(jwt.getUserId())
				.orElseThrow(() -> new ResourceNotFoundException("Customer profile not found."));

		Beneficiary entity = beneficiaryRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found."));

		if (!customer.getCustomerId().equals(entity.getCustomer().getCustomerId())) {
			return ResponseEntity.badRequest().body(new ApiResponse("failure", "Unauthorized to update this beneficiary."));
		}

		entity.setBeneficiaryName(name.trim());
		beneficiaryRepository.save(entity);
		return ResponseEntity.ok(new ApiResponse("success", "Beneficiary name updated successfully."));
	}
}

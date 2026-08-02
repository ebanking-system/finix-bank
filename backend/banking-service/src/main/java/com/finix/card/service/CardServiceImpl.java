package com.finix.card.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finix.account.entity.Account;
import com.finix.account.repository.AccountRepository;
import com.finix.auth.dto.JwtDTO;
import com.finix.card.dto.CardRequestDTO;
import com.finix.card.entity.Cards;
import com.finix.card.entity.Status;
import com.finix.common.exception.ResourceNotFoundException;
import com.finix.customer.entity.Customer;
import com.finix.customer.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Transactional
@Service

public class CardServiceImpl implements CardService {
	private final CardRepository cardRepository;
	private final ModelMapper mapper;
	private final CustomerRepository customerRepository;
	private final AccountRepository accountRepository;
	private static final SecureRandom random = new SecureRandom();

	@Override
	public ResponseEntity<?> addCard(CardRequestDTO DTO) {

	    Authentication authentication =
	            SecurityContextHolder.getContext().getAuthentication();

	    JwtDTO jwt = (JwtDTO) authentication.getPrincipal();

	    Long customerId = jwt.getUserId();
	    
	    System.out.println("Customer Id : "+customerId);
	    Customer customer = customerRepository.findById(customerId)
	            .orElseThrow(() -> 
	                new ResourceNotFoundException("Customer not found"));


	    Account account = accountRepository.findByAccountTypeAndCustomer(DTO.getAccountType(),customer);
	            

	    if (!account.getCustomer().getCustomerId().equals(customerId)) {
	        throw new AccessDeniedException(
	                "You cannot issue a card for another customer's account.");
	    }


	    // DTO -> Entity
	    Cards card = mapper.map(DTO, Cards.class);


	    card.setAccount(account);


	    String holderName = Stream.of(
	                customer.getFirstName(),
	                customer.getMiddleName(),
	                customer.getLastName())
	            .filter(name -> name != null && !name.isBlank())
	            .collect(Collectors.joining(" "));


	    card.setCardHolderName(holderName);

	    card.setCardNum(generateUniqueCardNumber());

	    card.setCvv(generateCVV());

	    card.setIssueDate(LocalDateTime.now());

	    card.setExpiryDate(LocalDateTime.now().plusYears(5));

	    card.setStatus(Status.ACTIVE);


	    Cards savedCard = cardRepository.save(card);


	    // Entity -> Response DTO
	    CardRequestDTO response =
	            mapper.map(savedCard, CardRequestDTO.class);


	    return ResponseEntity
	            .status(HttpStatus.CREATED)
	            .body(response);
	}

	private String generateCVV() {
		int cvv = 100 + random.nextInt(900);
		return String.valueOf(cvv);
	}

	private String generateUniqueCardNumber() {

		String cardNumber;

		do {
			cardNumber = generateCardNumber();
		} while (cardRepository.existsByCardNum(cardNumber));

		return cardNumber;
	}

	private String generateCardNumber() {
		StringBuilder cardNumber = new StringBuilder();

		// First digit
		cardNumber.append("4");

		// Remaining 15 digits
		for (int i = 1; i < 16; i++) {
			cardNumber.append(random.nextInt(10));
		}
		return cardNumber.toString();
	}
}

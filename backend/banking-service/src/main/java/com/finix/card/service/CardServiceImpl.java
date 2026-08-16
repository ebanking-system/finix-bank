package com.finix.card.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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
import com.finix.account.entity.AccountStatus;
import com.finix.account.entity.AccountType;
import com.finix.account.repository.AccountRepository;
import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.JwtDTO;
import com.finix.auth.entity.Role;
import com.finix.card.dto.CardRequestDTO;
import com.finix.card.dto.CardRequestDTO_GetCard;
import com.finix.card.dto.CardRequestDTO_PinChange;
import com.finix.card.dto.CardResponseDTO_PinChange;
import com.finix.card.entity.CardType;
import com.finix.card.entity.Cards;
import com.finix.card.entity.Status;
import com.finix.common.exception.BusinessException;
import com.finix.common.exception.ResourceNotFoundException;
import com.finix.customer.entity.Customer;
import com.finix.customer.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
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
	public ResponseEntity<?> addCard(CardRequestDTO dto) {
		if (dto == null || dto.getAccountType() == null || dto.getCardType() == null) {
			throw new BusinessException("Account type and card type are required.");
		}

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
			throw new BusinessException("User is unauthenticated.");
		}

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
		Long customerId = jwt.getUserId();

		Customer customer = customerRepository.findById(customerId)
				.orElseThrow(() -> new ResourceNotFoundException("Customer profile not found."));

		Account account = accountRepository.findFirstByCustomerAndAccountTypeAndStatus(
				customer, dto.getAccountType(), AccountStatus.ACTIVE)
				.orElse(accountRepository.findByCustomerAndAccountType(customer, dto.getAccountType()));

		if (account == null) {
			throw new BusinessException("You must have an active " + dto.getAccountType() + " account before requesting a card. Please open an account first.");
		}

		if (account.getStatus() != AccountStatus.ACTIVE) {
			throw new BusinessException("Your " + dto.getAccountType() + " account is currently inactive or pending KYC verification.");
		}

		if (cardRepository.existsByAccountAndCardType(account, dto.getCardType())) {
			return ResponseEntity.badRequest()
					.body(new ApiResponse("Failed", "A " + dto.getCardType() + " card is already linked to your " + dto.getAccountType() + " account."));
		}

		Cards card = new Cards();
		card.setAccount(account);
		card.setCardType(dto.getCardType());

		String holderName = Stream.of(customer.getFirstName(), customer.getMiddleName(), customer.getLastName())
				.filter(name -> name != null && !name.isBlank()).collect(Collectors.joining(" "));
		if (holderName.isBlank()) {
			holderName = "VALUED CUSTOMER";
		}
		card.setCardHolderName(holderName);

		card.setCardNum(generateUniqueCardNumber());
		card.setCvv(generateCVV());
		card.setIssueDate(LocalDateTime.now());
		card.setExpiryDate(LocalDateTime.now().plusYears(5));
		card.setStatus(Status.ACTIVE);
		card.setPin(generatePin());

		Cards savedCard = cardRepository.save(card);

		CardRequestDTO_GetCard responseDto = mapToCardDto(savedCard);
		return ResponseEntity.ok(new ApiResponse("SUCCESS", responseDto));
	}

	private String maskCardNumber(String fullPan) {
		if (fullPan == null || fullPan.length() < 4) {
			return "•••• •••• •••• 0000";
		}
		String last4 = fullPan.substring(fullPan.length() - 4);
		return "•••• •••• •••• " + last4;
	}

	private CardRequestDTO_GetCard mapToCardDto(Cards card) {
		CardRequestDTO_GetCard dto = new CardRequestDTO_GetCard();
		dto.setCardId(card.getCardId());
		dto.setCardHolderName(card.getCardHolderName());
		dto.setCardNum(maskCardNumber(card.getCardNum()));
		dto.setCardType(card.getCardType());
		dto.setExpiryDate(card.getExpiryDate());
		dto.setIssueDate(card.getIssueDate());
		dto.setStatus(card.getStatus());
		dto.setCvv("•••");
		if (card.getAccount() != null) {
			dto.setAccountType(card.getAccount().getAccountType());
			dto.setAccountNumber(card.getAccount().getAccountNumber());
			if (card.getAccount().getCustomer() != null) {
				dto.setCustomerId(card.getAccount().getCustomer().getCustomerId());
			}
		}
		return dto;
	}

	private String generatePin() {
		int pin = 1000 + random.nextInt(9000);
		return String.valueOf(pin);
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
		cardNumber.append("4"); // Visa BIN prefix
		for (int i = 1; i < 16; i++) {
			cardNumber.append(random.nextInt(10));
		}
		return cardNumber.toString();
	}

	@Override
	public ResponseEntity<?> getCard(AccountType accountType) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
			return ResponseEntity.ok(new ArrayList<>());
		}

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
		Long customerId = jwt.getUserId();

		Customer customer = customerRepository.findById(customerId).orElse(null);
		if (customer == null) {
			return ResponseEntity.ok(new ArrayList<>());
		}

		Account account = accountRepository.findFirstByCustomerAndAccountTypeAndStatus(
				customer, accountType, AccountStatus.ACTIVE)
				.orElse(accountRepository.findByCustomerAndAccountType(customer, accountType));

		if (account == null) {
			return ResponseEntity.ok(new ArrayList<>());
		}

		List<Cards> cards = cardRepository.findByAccount(account);
		List<CardRequestDTO_GetCard> response = cards.stream()
				.map(this::mapToCardDto)
				.collect(Collectors.toList());

		return ResponseEntity.ok(response);
	}

	@Override
	public ResponseEntity<?> deactivateCard(Status status, AccountType accountType, CardType cardType) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
			throw new BusinessException("User is unauthenticated.");
		}

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
		Long customerId = jwt.getUserId();

		Customer customer = customerRepository.findById(customerId)
				.orElseThrow(() -> new ResourceNotFoundException("Customer profile not found."));

		Account account = accountRepository.findFirstByCustomerAndAccountTypeAndStatus(
				customer, accountType, AccountStatus.ACTIVE)
				.orElse(accountRepository.findByCustomerAndAccountType(customer, accountType));

		if (account == null) {
			throw new ResourceNotFoundException("Account not found.");
		}

		Cards card = cardRepository.findByAccountAndCardType(account, cardType)
				.orElseThrow(() -> new ResourceNotFoundException("Card not found."));

		if (card.getStatus() == Status.ACTIVE) {
			card.setStatus(Status.BLOCKED);
			cardRepository.save(card);
			return ResponseEntity.ok(new ApiResponse("SUCCESS", "Card #" + card.getCardId() + " has been BLOCKED."));
		} else {
			card.setStatus(Status.ACTIVE);
			cardRepository.save(card);
			return ResponseEntity.ok(new ApiResponse("SUCCESS", "Card #" + card.getCardId() + " has been UNBLOCKED and is now ACTIVE."));
		}
	}

	@Override
	public ResponseEntity<?> toggleCardBlock(Long cardId) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
			throw new BusinessException("User is unauthenticated.");
		}

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();

		Cards card = cardRepository.findById(cardId)
				.orElseThrow(() -> new ResourceNotFoundException("Card #" + cardId + " not found."));

		if ("CUSTOMER".equalsIgnoreCase(jwt.getRoleName()) || "ROLE_CUSTOMER".equalsIgnoreCase(jwt.getRoleName())) {
			Long customerId = jwt.getUserId();
			if (card.getAccount() == null || card.getAccount().getCustomer() == null ||
					!card.getAccount().getCustomer().getCustomerId().equals(customerId)) {
				throw new AccessDeniedException("You are not authorized to manage this card.");
			}
		}

		if (card.getStatus() == Status.ACTIVE) {
			card.setStatus(Status.BLOCKED);
		} else {
			card.setStatus(Status.ACTIVE);
		}

		cardRepository.save(card);
		return ResponseEntity.ok(new ApiResponse("SUCCESS", "Card status updated to " + card.getStatus()));
	}

	@Override
	public ResponseEntity<?> updatePin(CardRequestDTO_PinChange request) {
		if (request == null || request.getPin() == null || request.getPin().length() < 4 || request.getPin().length() > 6) {
			throw new BusinessException("PIN must be between 4 and 6 digits.");
		}

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
			throw new BusinessException("User is unauthenticated.");
		}

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
		Long customerId = jwt.getUserId();

		Customer customer = customerRepository.findById(customerId)
				.orElseThrow(() -> new ResourceNotFoundException("Customer profile not found."));

		Account account = accountRepository.findFirstByCustomerAndAccountTypeAndStatus(
				customer, request.accountType, AccountStatus.ACTIVE)
				.orElse(accountRepository.findByCustomerAndAccountType(customer, request.accountType));

		if (account == null) {
			throw new ResourceNotFoundException("Account not found.");
		}

		Cards card = cardRepository.findByAccountAndCardType(account, request.cardType)
				.orElseThrow(() -> new ResourceNotFoundException("Card not found."));

		if (request.getPin().equals(card.getPin())) {
			return ResponseEntity.badRequest().body(new ApiResponse("FAILED", "New PIN cannot be the same as your existing PIN."));
		}

		card.setPin(request.getPin());
		cardRepository.save(card);

		return ResponseEntity.ok(new ApiResponse("SUCCESS", "Card security PIN updated successfully."));
	}

	@Override
	public ResponseEntity<?> getAllCards() {
		List<Cards> cards = cardRepository.findAllByOrderByIssueDateDesc();
		List<CardRequestDTO_GetCard> response = cards.stream()
				.map(this::mapToCardDto)
				.collect(Collectors.toList());
		return ResponseEntity.ok(new ApiResponse("SUCCESS", response));
	}

	@Override
	public ResponseEntity<?> updateCardStatus(Long cardId, Status newStatus) {
		Cards card = cardRepository.findById(cardId)
				.orElseThrow(() -> new ResourceNotFoundException("Card #" + cardId + " not found."));

		card.setStatus(newStatus);
		cardRepository.save(card);
		return ResponseEntity.ok(new ApiResponse("SUCCESS", "Card #" + cardId + " status updated to " + newStatus));
	}
}

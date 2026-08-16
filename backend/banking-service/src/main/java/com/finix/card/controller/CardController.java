package com.finix.card.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finix.account.entity.AccountType;
import com.finix.card.dto.CardRequestDTO;
import com.finix.card.dto.CardRequestDTO_PinChange;
import com.finix.card.entity.CardType;
import com.finix.card.entity.Status;
import com.finix.card.service.CardService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cards")
public class CardController {
	
	private final CardService cardService;
	
	@PostMapping("/add")
	public ResponseEntity<?> addCard(@RequestBody @Valid CardRequestDTO card) {
		return cardService.addCard(card);
	}

	@GetMapping("/get/{accountType}")
	public ResponseEntity<?> getCard(@PathVariable AccountType accountType) {
		return cardService.getCard(accountType);
	}

	@PatchMapping("/{cardId}/toggle-block")
	public ResponseEntity<?> toggleBlock(@PathVariable Long cardId) {
		return cardService.toggleCardBlock(cardId);
	}

	@PutMapping("/deactivate")
	public ResponseEntity<?> deactivateCard(
			@RequestParam(required = false) Status status,
			@RequestParam AccountType accountType,
			@RequestParam CardType cardType) {
		return cardService.deactivateCard(status != null ? status : Status.BLOCKED, accountType, cardType);
	}

	@PatchMapping("/pinUpdate")
	public ResponseEntity<?> updatePin(@RequestBody @Valid CardRequestDTO_PinChange request) {
		return cardService.updatePin(request);
	}

	@GetMapping("/all")
	public ResponseEntity<?> getAllCards() {
		return cardService.getAllCards();
	}

	@PatchMapping("/{cardId}/status/{status}")
	public ResponseEntity<?> updateCardStatus(@PathVariable Long cardId, @PathVariable Status status) {
		return cardService.updateCardStatus(cardId, status);
	}
}

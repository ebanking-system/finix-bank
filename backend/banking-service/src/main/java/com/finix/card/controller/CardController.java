package com.finix.card.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finix.account.entity.AccountType;
import com.finix.auth.dto.ApiResponse;
import com.finix.card.dto.CardRequestDTO;
import com.finix.card.dto.CardRequestDTO_PinChange;
import com.finix.card.entity.CardType;
import com.finix.card.entity.Cards;
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
	public ResponseEntity<?> addCard(@RequestBody @Valid CardRequestDTO card){
		try {
	        return cardService.addCard(card);
	    }
	    catch(RuntimeException e) {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse("Failed", e.getMessage()));
	    }
	}
	@GetMapping("/get/{accountType}")
	public ResponseEntity<?> getCard(@PathVariable AccountType accountType){
		try {
	        return ResponseEntity.ok(cardService.getCard(accountType));
	    }
	    catch(RuntimeException e) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse("Failed", e.getMessage()));
	    }
	}
	@PutMapping("/deactivate")
	public ResponseEntity<?> deactivateCard(@RequestBody Status status, AccountType accountType, CardType cardType){
		try {
			return ResponseEntity.ok(cardService.deactivateCard(status, accountType, cardType));
		}
		catch(RuntimeException e){
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse("Failed", e.getMessage()));
		}
	}
	@PatchMapping("/pinUpdate")
	public ResponseEntity<?> updatePin(@RequestBody CardRequestDTO_PinChange request){
		try {
			return ResponseEntity.ok(cardService.updatePin(request));
		}
		catch(RuntimeException e){
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse("Failed", e.getMessage()));
		}
	}
}

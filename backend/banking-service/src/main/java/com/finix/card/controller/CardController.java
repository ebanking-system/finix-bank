package com.finix.card.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finix.auth.dto.ApiResponse;
import com.finix.card.dto.CardRequestDTO;
import com.finix.card.entity.Cards;
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
}

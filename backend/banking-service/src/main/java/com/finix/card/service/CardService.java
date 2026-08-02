package com.finix.card.service;

import org.springframework.http.ResponseEntity;

import com.finix.card.dto.CardRequestDTO;

public interface CardService {

	ResponseEntity<?> addCard(CardRequestDTO card);
	
}

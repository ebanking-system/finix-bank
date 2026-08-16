package com.finix.card.service;

import org.springframework.http.ResponseEntity;

import com.finix.account.entity.AccountType;
import com.finix.card.dto.CardRequestDTO;
import com.finix.card.dto.CardRequestDTO_PinChange;
import com.finix.card.entity.CardType;
import com.finix.card.entity.Status;

public interface CardService {

	ResponseEntity<?> addCard(CardRequestDTO card);

	ResponseEntity<?> getCard(AccountType accountType);

	ResponseEntity<?> deactivateCard(Status status, AccountType accountType, CardType cardType);

	ResponseEntity<?> toggleCardBlock(Long cardId);

	ResponseEntity<?> updatePin(CardRequestDTO_PinChange request);

	ResponseEntity<?> getAllCards();

	ResponseEntity<?> updateCardStatus(Long cardId, Status newStatus);
}

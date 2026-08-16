package com.finix.card.dto;

import java.time.LocalDateTime;
import com.finix.account.entity.AccountType;
import com.finix.card.entity.CardType;
import com.finix.card.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CardRequestDTO_GetCard {
	
	private Long cardId;
  
    private String cardHolderName;

    private String cardNum; // Masked e.g. "•••• •••• •••• 1234"

    private CardType cardType;

    private AccountType accountType;

    private String accountNumber;

    private Long customerId;

    private LocalDateTime issueDate;

    private LocalDateTime expiryDate;

    private Status status;

    private String cvv; // "•••"
}
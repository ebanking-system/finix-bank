package com.finix.card.dto;

import java.time.LocalDateTime;

import org.hibernate.annotations.CurrentTimestamp;

import com.finix.account.entity.Account;
import com.finix.account.entity.AccountType;
import com.finix.card.entity.CardType;
import com.finix.card.entity.Status;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    private String cardNum;

    private CardType cardType;

    private LocalDateTime expiryDate;

    private Status status;
}
package com.finix.card.dto;

import com.finix.account.entity.Account;
import com.finix.account.entity.AccountType;
import com.finix.card.entity.CardType;


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
public class CardRequestDTO {
	
	private AccountType accountType;
	
    @NotNull(message = "Card type cannot be null")
    private CardType cardType;
}
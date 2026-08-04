package com.finix.card.dto;

import com.finix.account.entity.AccountType;
import com.finix.card.entity.CardType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CardRequestDTO_PinChange {
	public AccountType accountType;
	public CardType cardType;
	public String pin;
}

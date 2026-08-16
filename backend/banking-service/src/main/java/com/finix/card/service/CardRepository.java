package com.finix.card.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.finix.account.entity.Account;
import com.finix.account.entity.AccountType;
import com.finix.card.entity.CardType;
import com.finix.card.entity.Cards;
import com.finix.card.entity.Status;

public interface CardRepository extends JpaRepository<Cards, Long> {

	boolean existsByCardNum(String cardNumber);

	List<Cards> findByAccount(Account account);

	boolean existsByAccountAndCardType(Account account, CardType cardType);

	Optional<Cards> findByAccountAndCardType(Account account, CardType cardType);

	Optional<Cards> findFirstByAccountAndAccount_AccountType(Account account, AccountType accountType);

	List<Cards> findByStatus(Status status);

	List<Cards> findAllByOrderByIssueDateDesc();
}

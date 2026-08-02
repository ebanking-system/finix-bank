package com.finix.card.service;

import org.springframework.data.jpa.repository.JpaRepository;

import com.finix.card.entity.Cards;

public interface CardRepository extends JpaRepository<Cards, Long> {

	boolean existsByCardNum(String cardNumber);

}

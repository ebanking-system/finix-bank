package com.finix.card.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CurrentTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
//import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
@Entity
@Table(name ="cards")
public class Cards {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)	
	private Long cardId;
	// accountId comes here 
	// association relationship here
	@Column(name = "card_holder_name", nullable = false)
	private String cardHolderName;
	@Column(name = "card_number")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private String cardNum;
	@Column(name = "card_type", nullable = false)
	@Enumerated(EnumType.STRING)
	private CardType cardType;
	@Column(name = "cvv")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private String Cvv;
	@Column(name = "issue_date")
	@CurrentTimestamp
	private LocalDateTime issueDate;
	@Column(name = "expiry_date")
	private LocalDateTime expiryDate;
	@Enumerated(EnumType.STRING)
	private Status status;
	
//  this below method is for handling expiry date of card, commenting this because 
//  writing this in the service layer is better approach
//	@PrePersist
//	public void prePersist() {
//		this.issueDate = LocalDateTime.now();
//		this.expiryDate = issueDate.plusYears(5);
//	}
	
	
}

package com.finix.card.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CurrentTimestamp;

import com.finix.account.entity.Account;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "cards")
public class Cards {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "card_id")
    private Long cardId;
    
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id",nullable = false)
    private Account account;

    @Column(name = "card_holder_name", nullable = false)
    private String cardHolderName;

    @Column(name = "card_number", nullable = false, unique = true, length = 16)
    private String cardNum;

    @Enumerated(EnumType.STRING)
    @Column(name = "card_type", nullable = false)
    private CardType cardType;

    @Column(name = "cvv", nullable = false, length = 3)
    private String cvv;

    @CurrentTimestamp
    @Column(name = "issue_date", nullable = false)
    private LocalDateTime issueDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;
    
    @Column(name = "pin", nullable = false, length = 6)
    public String pin;
    
	//this below method is for handling expiry date of card, commenting this because 
	//writing this in the service layer is better approach
	//	@PrePersist
	//	public void prePersist() {
	//		this.issueDate = LocalDateTime.now();
	//		this.expiryDate = issueDate.plusYears(5);
	//	}
}
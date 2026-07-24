package com.finix.fd.entity;

import java.text.DecimalFormat;
import java.time.LocalDateTime;

import org.hibernate.annotations.CurrentTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
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
@Table(name = "fixed_deposits")
public class FixedDeposits {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long fdId;
//  accountId comes here
	@Column(name = "deposit_amount", nullable = false)
	private DecimalFormat depositAmount;
	@Column(name = "interest_rate")
	private DecimalFormat interestRate;
	@Column(name = "tenure_months")
	@Enumerated(EnumType.STRING)
	private Tenure tenureMonths;
	@CurrentTimestamp
	@Column(name = "start_date")
	private LocalDateTime startDate;
	@Column(name = "maturity_date")
	private LocalDateTime maturityDate;
	@Column(name = "maturity_amount")
	private DecimalFormat maturityAmount;
	@Column(name = "status")
	@Enumerated(EnumType.STRING)
	private Status status;
	
//	@PrePersist
//	public void prePersist() {
//		this.startDate = LocalDateTime.now();
//		this.maturityDate = startDate.plusYears();
//		this.maturityAmount = depositAmount*
//	}
}

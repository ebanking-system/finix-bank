package com.finix.kyc.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CurrentTimestamp;

import com.finix.customer.entity.Customer;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NegativeOrZero;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;


@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString(exclude = "customer")
@Entity
@Table(name = "kyc_documents")
public class KycDocuments {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="customer_id")
	private Customer customer;

	@Column(name="aadhar_number", nullable = false, unique = true)
	private String aadharNum;
	
	@Column(name="pan_num", nullable = false, unique= true)
	private String panNum;
	
	@Column(name="self_image", nullable = false)
	private String selfImage;
	
	@Enumerated(EnumType.STRING)
	private Status status;
	
	@CurrentTimestamp
	@Column(name="submitted_date")
	private LocalDateTime submittedDate;
}

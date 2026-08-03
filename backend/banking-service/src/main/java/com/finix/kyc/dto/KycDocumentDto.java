package com.finix.kyc.dto;

import java.time.LocalDateTime;

import org.hibernate.annotations.CurrentTimestamp;

import com.finix.customer.entity.Customer;
import com.finix.kyc.entity.Status;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KycDocumentDto {

	private Customer customer;

	private String aadharNum;
	
	private String panNum;
	
	private String selfImage;
	
	private Status status;
	
	private LocalDateTime submittedDate;
}

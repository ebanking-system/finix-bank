package com.finix.kyc.dto;

import java.time.LocalDateTime;


import com.finix.customer.entity.Customer;
import com.finix.kyc.entity.Status;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KycDocumentDto3 {

	private Long id;
	
	private Long customerId;

	private String aadharNum;
	
	private String panNum;
	
	private String selfImage;
	
	private Status status;
	
	private LocalDateTime submittedDate;
}

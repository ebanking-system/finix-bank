package com.finix.kyc.dto;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KycDocumentDto2 {

	@Pattern(regexp = "^$|^[0-9]{12}$", message = "Aadhaar number must be exactly 12 numeric digits")
	private String aadharNum;
	
	@Pattern(regexp = "^$|^[A-Z]{5}[0-9]{4}[A-Z]$", message = "Invalid PAN card format (e.g. ABCDE1234F). Must be 10 characters: 5 uppercase letters, 4 digits, 1 uppercase letter")
	private String panNum;
	
	private String selfImage;
}

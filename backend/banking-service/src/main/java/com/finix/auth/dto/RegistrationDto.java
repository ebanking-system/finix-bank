package com.finix.auth.dto;

import java.time.LocalDate;

import com.finix.account.entity.AccountType;
import com.finix.auth.entity.Role;
import com.finix.employee.entity.Department;
import com.finix.employee.entity.Designation;

import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
public class RegistrationDto {
	 private String email;
	 private String passwordHash;
	 private Role role;
	 private AccountType accountType;
	 private String firstName;
	 private String middleName;
	 private String lastName;
	 private LocalDate dob;
	 private String mobile;
	 private String address;

	 @Pattern(regexp = "^$|^[0-9]{12}$", message = "Aadhaar number must be exactly 12 numeric digits")
	 private String aadharNum;	

	 @Pattern(regexp = "^$|^[A-Z]{5}[0-9]{4}[A-Z]$", message = "Invalid PAN number format (e.g. ABCDE1234F). Must be 10 characters: 5 uppercase letters, 4 digits, 1 uppercase letter")
	 private String panNum;

	 private Department department;
	 private Designation designation;
}

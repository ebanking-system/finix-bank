package com.finix.auth.dto;

import java.time.LocalDate;

import com.finix.account.entity.AccountType;
import com.finix.auth.entity.Role;
import com.finix.employee.entity.Department;
import com.finix.employee.entity.Designation;

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
	 private String aadharNum;	
	 private String panNum;
	 private Department department;
	 private Designation designation;
}

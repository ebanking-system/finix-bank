package com.finix.auth.dto;

import java.time.LocalDate;

import com.finix.auth.entity.Role;

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
	 private String firstName;
	 private String middleName;
	 private String lastName;
	 private LocalDate dob;
	 private String mobile;
	 private String address;
}

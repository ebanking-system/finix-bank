package com.finix.auth.dto;

import com.finix.auth.entity.Role;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//(user id ,name, email , role , message)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AuthResponse {
	private Long id;
	private Role userRole;
	private String jwt;
}

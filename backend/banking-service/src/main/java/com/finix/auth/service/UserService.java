package com.finix.auth.service;

import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.AuthRequest;
import com.finix.auth.dto.AuthResponse;
import com.finix.auth.dto.RegistrationDto;

import jakarta.validation.Valid;

public interface UserService {

	AuthResponse authenticate(AuthRequest request);

	ApiResponse encryptPasswords();

	ApiResponse registration(@Valid RegistrationDto registrationDto);

}

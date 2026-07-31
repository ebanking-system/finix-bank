package com.finix.auth.service;

import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.AuthRequest;
import com.finix.auth.dto.AuthResponse;

public interface UserService {

	AuthResponse authenticate(AuthRequest request);

	ApiResponse encryptPasswords();

}

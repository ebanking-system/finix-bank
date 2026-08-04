package com.finix.auth.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finix.auth.dto.AuthRequest;
import com.finix.auth.dto.RegistrationDto;
import com.finix.auth.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {
	// depcy -constr based D.I
	private final UserService userService;

	/*
	 * Desc - User signin URI - /users/signin Method - POST Payload - request body -
	 * email , password (AuthRequest - DTO) Success Resp -SC 200 + Auth Resp (user
	 * id ,name, email , role , message) Failure Resp - SC 401 + ApiResp DTO(status
	 * : failure , timestamp , message)
	 */
	@PostMapping("/signin")
	public ResponseEntity<?> userSignIn(@RequestBody @Valid  AuthRequest request) {
		System.out.println("in user sign in " + request);
		
			// call service layer method
			return ResponseEntity.ok(userService.authenticate(request));
	}
	
	@PostMapping("/signup")
	public ResponseEntity<?> userSignup(@RequestBody @Valid RegistrationDto registrationDto){
		return ResponseEntity.ok(userService.registration(registrationDto));
	}
	/*
	 * URI - /password-encryption
	 * Method - PATCH
	 * I/P - none
	 * DB Action - raw pwds -> encrypted pwds
	 * Resp - Api Resp (success | failed_
	 */
	@PatchMapping("/password-encryption")
	public ResponseEntity<?> encryptUserPasswords() {
		return ResponseEntity.ok(userService.encryptPasswords());
	}

}

package com.finix.security;


import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finix.auth.entity.User;
import com.finix.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CustomUserDetailsServiceImpl implements UserDetailsService {
	private final UserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		User user=userRepository.findByEmail(email);
//				.orElseThrow(() -> new RuntimeException("User by this email doesn't exist !!!!!"));
		//=> user by email - exists
		return new CustomUserDetailsImpl(user.getUserId(),user.getEmail(),user.getPasswordHash(),user.getRole());
	}

}

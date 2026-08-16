package com.finix.security;

import java.util.Date;
import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtUtils {

	@Value("${jwt.exp.time}")
	private long expTime;

	@Value("${jwt.secret.key}")
	private String key;

	private SecretKey secretKey;

	@PostConstruct
	public void myInit() {
		secretKey = Keys.hmacShaKeyFor(key.getBytes());
		log.info("****** JWT SecretKey initialized: {} *****", secretKey.getAlgorithm());
	}

	/**
	 * Generate signed JWT token with standard subject, iat, exp and custom claims.
	 */
	public String generateJwt(CustomUserDetailsImpl userDetails) {
		Date createdAt = new Date();
		Date expAt = new Date(createdAt.getTime() + expTime);

		return Jwts.builder()
				.subject(userDetails.getEmail())
				.issuedAt(createdAt)
				.expiration(expAt)
				.claim("user_id", userDetails.getUserId())
				.claim("user_role", userDetails.getRole().name())
				.signWith(secretKey)
				.compact();
	}

	/**
	 * Verify JWT signature and parse claims payload.
	 */
	public Claims verifyJwt(String jwt) {
		return Jwts.parser()
				.verifyWith(secretKey)
				.build()
				.parseSignedClaims(jwt)
				.getPayload();
	}
}

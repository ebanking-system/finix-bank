package com.finix.security;

import java.util.Date;

import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Component // declares spring bean
@Slf4j
public class JwtUtils {
	/*
	 * value based D.I - SC SC solves SpEL & extracts its value -> variable
	 * 
	 */
	@Value("${jwt.exp.time}") // SpEl - Spring expression language
	private long expTime;
	@Value("${jwt.secret.key}")
	private String key;
	private SecretKey secretKey;

	@PostConstruct
	public void myInit() {

		secretKey = Keys.hmacShaKeyFor(key.getBytes());
		log.info("****** in init ***** {} ", secretKey);
	}

	/*
	 * Add a method to generate JWT
	 */
	public String generateJwt(CustomUserDetailsImpl userDetails) {
		Date createdAt = new Date();
		Date expAt=new Date(createdAt.getTime()+expTime);
		return Jwts.builder()  //Creates JWT builder
				.subject(userDetails.getEmail()) //setting subject - claim
				.issuedAt(createdAt) //iat - claim
				.expiration(expAt) //exp - claim
				.claims(Map.of("user_id", userDetails.getUserId(),//for adding uid -> for extra validation
						"user_role", userDetails.getRole().name())) //to avois select query per request to get role
				.signWith(secretKey)
				.compact();//Jackson serializes the signed JWT & rets to the caller

	}
	/*
	 * Add a method 
	 * - to verify JWT
	 * - return the payload (Claims - object)
	 */
	public Claims verifyJwt(String jwt)
	{
		return Jwts.parser() //creates a parser to parse the token
				.verifyWith(secretKey) //using same secret key for verification
				.build() //builds JWT parser object
				.parseSignedClaims(jwt) //validating - jwt structure , exp time , tampering
				//=> valid JWT 
				.getPayload(); //extract the claims
	}

}

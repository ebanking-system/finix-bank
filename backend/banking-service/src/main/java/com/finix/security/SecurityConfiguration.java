package com.finix.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration // declares Java configuration class - to declare spring beans
@EnableWebSecurity // to enable spring web security
@EnableMethodSecurity // to enable method level authorization rules 
@RequiredArgsConstructor
public class SecurityConfiguration {
	private final CustomJwtVerificationFilter jwtFilter;
	/*
	 * Configure spring sec filter chain 
	 *  - from spring bean HttpSecurity 
	 *   - Builder class , to customize filter chain
	 */
	@Bean
	SecurityFilterChain customizeSecurityFilterChain(HttpSecurity http) throws Exception {
		//1. disable CSRF protection
		http.csrf(csrf->csrf.disable());
		//2. Disable HttpSession creation (Spring security will NOT create HttpSession
		// to store security context info.)
		http.sessionManagement(session -> 
		session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
		//3. Retain BasicAuthentication scheme -with default 
	//	http.httpBasic(Customizer.withDefaults());
		//Disable by default form based authentication
		/*4. Define URL based authorization rules
		 * 4.1 public end points 
		 *  - swagger , sign in , sign up , get all doctors ...
		 *  - for React App (browser JS app) 
		 *   - permit pre flight request - HttpMethod - Options
		 * 4.2 book appointment 
		 *  - authentication + ROLE_PATIENT
		 * 4.3 Get all appointments , get all patients 
		 *  - authentication + ROLE_ADMIN
		 * 4.4 Mark Appointment complete + prescribe diag tests 
		 *  - authentication + ROLE_DOCTOR
		 *  4.5 Remaining all end points 
		 *   - only authentication
		 */
		http.authorizeHttpRequests(request ->
		request.requestMatchers("/v3/api-docs/**","/swagger-ui/**",
				"/api/auth/signin","/api/auth/signup","/api/employees/signup","/users/password-encryption",
				"/api/kyc/files/**", "/api/employees/photo/**")	
		.permitAll()
		.requestMatchers(HttpMethod.OPTIONS).permitAll()
		.requestMatchers(HttpMethod.POST, "/api/accounts", "/api/accounts/deposit", "/api/transaction")
		.hasRole("CUSTOMER")
		.requestMatchers(HttpMethod.POST, "/api/accounts/employee/deposit")
		.hasAnyRole("EMPLOYEE", "MANAGER")
		.requestMatchers(HttpMethod.GET, "/api/accounts/**", "/api/transaction")
		.hasAnyRole("CUSTOMER","EMPLOYEE","MANAGER")
		// Beneficiary endpoints
		.requestMatchers("/api/beneficiary/**", "/api/beneficiary")
		.hasRole("CUSTOMER")
		//Loan api endpoints
		.requestMatchers(HttpMethod.POST, "/api/loans/apply")
		.hasRole("CUSTOMER")
		.requestMatchers(HttpMethod.GET, "/api/loans/my-loans")
		.hasRole("CUSTOMER")
		.requestMatchers(HttpMethod.GET, "/api/loans/*/repayments")
		.hasRole("CUSTOMER")
		.requestMatchers(HttpMethod.GET, "/api/loans/all", "/api/loans/status/**", "/api/loans/pending")
		.hasAnyRole("EMPLOYEE", "MANAGER")
		.requestMatchers(HttpMethod.PUT, "/api/loans/**", "/api/loans/*/approve", "/api/loans/*/reject", "/api/loans/*/disburse")
		.hasAnyRole("EMPLOYEE", "MANAGER")
		.requestMatchers(HttpMethod.POST,"/api/loans/repayments/*/pay")
		.hasRole("CUSTOMER")
		.requestMatchers(HttpMethod.GET,"/api/loans/defaulted")
		.hasAnyRole("MANAGER","EMPLOYEE")
		.requestMatchers(HttpMethod.DELETE, "/api/loan-types/**")
		.hasAnyRole("EMPLOYEE", "MANAGER")
		//Loan api endpoints end
		.requestMatchers(HttpMethod.GET,"/appointments","/patients")
		.hasRole("ADMIN")
		.requestMatchers(HttpMethod.PATCH,"/appointments/complete")
		.hasRole("DOCTOR")
		//Customer api endpoints
		.requestMatchers(HttpMethod.GET, "/api/customers/profile")
		.hasRole("CUSTOMER")
		.requestMatchers(HttpMethod.PATCH, "/api/customers/profile")
		.hasRole("CUSTOMER")
		//KYC END POINTS
		.requestMatchers(HttpMethod.POST, "/api/kyc/upload", "/api/kyc/upload/**")
		.hasRole("CUSTOMER")
		.requestMatchers(HttpMethod.PATCH,"/api/kyc")
		.hasRole("CUSTOMER")
		.requestMatchers(HttpMethod.GET,"/api/kyc/my")
		.hasRole("CUSTOMER")
		.requestMatchers(HttpMethod.GET,"/api/kyc/all")
		.hasAnyRole("EMPLOYEE","MANAGER")
		.requestMatchers(HttpMethod.GET,"/api/kyc/status/**")
		.hasAnyRole("EMPLOYEE","MANAGER")
		.requestMatchers(HttpMethod.PATCH,"/api/kyc/**")
		.hasAnyRole("EMPLOYEE","MANAGER")
		//Cards End Points
		.requestMatchers(HttpMethod.POST,"/api/cards/add")
		.hasRole("CUSTOMER")
		.requestMatchers(HttpMethod.GET,"/api/cards/get/**")
		.hasRole("CUSTOMER")
		.requestMatchers(HttpMethod.PUT,"/api/cards/deactivate")
		.hasRole("CUSTOMER")
		.requestMatchers(HttpMethod.PATCH,"/api/cards/pinUpdate")
		.hasRole("CUSTOMER")
		.requestMatchers(HttpMethod.PATCH,"/api/cards/*/toggle-block")
		.hasAnyRole("CUSTOMER", "EMPLOYEE", "MANAGER")
		.requestMatchers(HttpMethod.GET,"/api/cards/all")
		.hasAnyRole("EMPLOYEE", "MANAGER")
		.requestMatchers(HttpMethod.PATCH,"/api/cards/*/status/**")
		.hasAnyRole("EMPLOYEE", "MANAGER")
		//FD End Points
		.requestMatchers(HttpMethod.POST, "/api/fd/create")
		.hasRole("CUSTOMER")
		.requestMatchers(HttpMethod.GET, "/api/fd/get/**")
		.hasRole("CUSTOMER")
		.requestMatchers(HttpMethod.GET, "/api/fd/all")
		.hasAnyRole("EMPLOYEE", "MANAGER")
		
		
		
		//Customer api endpoints end
		//Employee api endpoints
		.requestMatchers(HttpMethod.GET, "/api/employees/profile")
		.hasAnyRole("EMPLOYEE","MANAGER")
		.requestMatchers(HttpMethod.PATCH, "/api/employees/profile")
		.hasAnyRole("EMPLOYEE","MANAGER")
		.requestMatchers(HttpMethod.POST, "/api/employees/profile/photo", "/api/employees/profile/change-password")
		.hasAnyRole("EMPLOYEE","MANAGER")
		.requestMatchers(HttpMethod.GET, "/api/employees")
		.hasRole("MANAGER")
		.requestMatchers(HttpMethod.GET, "/api/employees/*")
		.hasRole("MANAGER")
		.requestMatchers(HttpMethod.PATCH, "/api/employees/*/assignment")
		.hasRole("MANAGER")
		.requestMatchers(HttpMethod.DELETE, "/api/employees/*")
		.hasRole("MANAGER")
		//Employee api endpoints end
		.anyRequest().authenticated()
		);
		//add custom jwt verification filter before - UsernamePasswordAuthFilter
		http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
		return http.build(); //rets the object of DefaultSecurityFilter -> implements -> SecurityFilterChain
	}
	/*
	 * Configure Password encoder bean
	 * - BCryptPasswordEncoder
	 *  - SHA with salt
	 *  - public boolean matches(String raw,String encPwd)
	 */
	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	/*
	 * Configure AuthenticationManager
	 *  - as spring bean
	 *  - using AuthConfig
	 */
	@Bean
	AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception
	{
		return config.getAuthenticationManager();
	}

}

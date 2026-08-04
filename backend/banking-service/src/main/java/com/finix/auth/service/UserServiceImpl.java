package com.finix.auth.service;


import java.time.LocalDateTime;

import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.finix.account.service.AccountServiceImpl;
import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.AuthRequest;
import com.finix.auth.dto.AuthResponse;
import com.finix.auth.dto.RegistrationDto;
import com.finix.auth.entity.Role;
import com.finix.auth.entity.User;
import com.finix.auth.repository.UserRepository;
import com.finix.customer.entity.Customer;
import com.finix.customer.repository.CustomerRepository;
import com.finix.employee.entity.Employee;
import com.finix.employee.repository.EmployeeRepository;
import com.finix.kyc.entity.KycDocuments;
import com.finix.kyc.entity.Status;
import com.finix.kyc.repository.KycDocumentRepository;
import com.finix.security.CustomUserDetailsImpl;
import com.finix.security.JwtUtils;
import com.finix.security.SecurityConfiguration;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor //init final fields
@Slf4j
public class UserServiceImpl implements UserService {

    private final AccountServiceImpl accountServiceImpl;

    private final KycDocumentRepository kycDocumentRepository;

    private final CustomerRepository customerRepository;
    
    private final EmployeeRepository employeeRepository;

    private final SecurityConfiguration securityConfiguration;
	//depcy - using constr based D.I
	private final UserRepository userRepository;
	//depcy - ModelMapper
	private final ModelMapper mapper;
	private final PasswordEncoder encoder;
	private final AuthenticationManager authenticationManager;
	private final JwtUtils jwtUtils;
	

	@Override
	public AuthResponse authenticate(AuthRequest request) {
		/*1. Create instance of UsernamePasswordAuthenticationToken 
		 * to hold email & password
		 * UsernamePasswordAuthenticationToken implements Authentication i/f
		 * public UsernamePasswordAuthenticationToken(Object email,Object password)
		 */
		UsernamePasswordAuthenticationToken authentication=new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
		/*
		 * 2. Simply call AuthenticationManager's authenticate method
		 * Method of AuthenticationManager
		 * public Authentication authenticate(Authentication auth)
		 * - throws AuthenticationException in case of failed auth
		 * - otherwise returns Authentication obj  - user details 
		 * 
		 */
		log.info("******* Before Auth - {}"+authentication.isAuthenticated());//f
		Authentication fullyAuthenticated = authenticationManager.authenticate(authentication);
		log.info("******* After Auth - {}"+fullyAuthenticated.isAuthenticated());//t
		log.info("***** Authetication {} ",fullyAuthenticated.getPrincipal().getClass());//CustomUserDetailsImpl
		log.info("***** Authetication {} ",fullyAuthenticated.getCredentials());//null
		/*
		 *3. Create signed JWT -> send it to client
		 * 
		 */
		CustomUserDetailsImpl userDetails=(CustomUserDetailsImpl) fullyAuthenticated.getPrincipal();		
		return new AuthResponse(userDetails.getUserId(), userDetails.getRole(), jwtUtils.generateJwt(userDetails));
	}

	@Override
	@Transactional
	public ApiResponse encryptPasswords() {
		userRepository.findAll() //List<User>
		.stream() //Stream<User>
		.forEach(user -> user.setPasswordHash(encoder.encode(user.getPasswordHash())));
		return new ApiResponse("Success", "Password encoded");
	}

	@Override
	@Transactional
	public ApiResponse registration(@Valid RegistrationDto registrationDto) {
		try {
			if(userRepository.existsByEmail(registrationDto.getEmail())) {
				System.out.print("inside other role");
				return new ApiResponse("Failure","Account Already Exist");
			}			
		}catch(Exception ex) {
			System.out.print(ex.getMessage());
		}
		try {
			User user=mapper.map(registrationDto, User.class);
			user.setPasswordHash(encoder.encode(user.getPasswordHash()));
			User userEntity=userRepository.save(user);
			if(registrationDto.getRole().equals(Role.CUSTOMER)) {
				
				System.out.print("User : "+user);
				Customer customer=mapper.map(registrationDto, Customer.class);
				customer.setUser(user);
				customerRepository.save(customer);		
				System.out.print("Customer : "+customer);
				KycDocuments kycEntity=mapper.map(registrationDto,KycDocuments.class);
				kycEntity.setCustomer(customer);
				kycEntity.setStatus(Status.PENDING);
				kycEntity.setSubmittedDate(LocalDateTime.now());
				kycDocumentRepository.save(kycEntity);
				accountServiceImpl.createAccount(registrationDto.getAccountType(),customer);
				System.out.print("KYC Entity : "+kycEntity);
			}else {
				
				Employee employee = mapper.map(registrationDto, Employee.class);
				employee.setUser(userEntity);
				employeeRepository.save(employee);
			}
		}catch(Exception ex) {
			return new ApiResponse("Failure",ex.getMessage());
		}
		
		return new ApiResponse("Succuss","User Created Succussfully");
	}
	
}

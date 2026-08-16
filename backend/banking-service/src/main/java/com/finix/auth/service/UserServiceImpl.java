package com.finix.auth.service;

import java.time.LocalDateTime;
import java.util.List;

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
import com.finix.notification.dto.NotificationEvent;
import com.finix.notification.producer.NotificationProducer;
import com.finix.security.CustomUserDetailsImpl;
import com.finix.security.JwtUtils;
import com.finix.security.SecurityConfiguration;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final AccountServiceImpl accountServiceImpl;
    private final KycDocumentRepository kycDocumentRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final SecurityConfiguration securityConfiguration;
	private final UserRepository userRepository;
	private final ModelMapper mapper;
	private final PasswordEncoder encoder;
	private final AuthenticationManager authenticationManager;
	private final JwtUtils jwtUtils;
	private final NotificationProducer notificationProducer;

	@Override
	public AuthResponse authenticate(AuthRequest request) {
		UsernamePasswordAuthenticationToken authentication =
				new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());

		log.info("******* Before Auth - {}", authentication.isAuthenticated());
		Authentication fullyAuthenticated = authenticationManager.authenticate(authentication);
		log.info("******* After Auth - {}", fullyAuthenticated.isAuthenticated());
		log.info("***** Authentication {} ", fullyAuthenticated.getPrincipal().getClass());

		CustomUserDetailsImpl userDetails = (CustomUserDetailsImpl) fullyAuthenticated.getPrincipal();		
		return new AuthResponse(userDetails.getUserId(), userDetails.getRole(), jwtUtils.generateJwt(userDetails));
	}

	@Override
	@Transactional
	public ApiResponse encryptPasswords() {
		userRepository.findAll()
				.forEach(user -> user.setPasswordHash(encoder.encode(user.getPasswordHash())));
		return new ApiResponse("Success", "Password encoded");
	}

	@Override
	@Transactional
	public ApiResponse registration(@Valid RegistrationDto registrationDto) {
		try {
			if (userRepository.existsByEmail(registrationDto.getEmail())) {
				return new ApiResponse("Failure", "Account Already Exist");
			}			
		} catch (Exception ex) {
			log.error("Email uniqueness check failed: {}", ex.getMessage());
		}

		try {
			User user = mapper.map(registrationDto, User.class);
			user.setPasswordHash(encoder.encode(user.getPasswordHash()));
			User userEntity = userRepository.save(user);

			if (registrationDto.getRole().equals(Role.CUSTOMER)) {
				Customer customer = mapper.map(registrationDto, Customer.class);
				customer.setUser(userEntity);
				Customer savedCustomer = customerRepository.save(customer);

				KycDocuments kycEntity = mapper.map(registrationDto, KycDocuments.class);
				kycEntity.setCustomer(savedCustomer);
				kycEntity.setStatus(Status.PENDING);
				kycEntity.setSubmittedDate(LocalDateTime.now());
				kycDocumentRepository.save(kycEntity);

				accountServiceImpl.createAccount(registrationDto.getAccountType(), savedCustomer);

				// Publish registration welcome notification to RabbitMQ
				try {
					NotificationEvent event = NotificationEvent.builder()
							.customerId(savedCustomer.getCustomerId())
							.eventType("CUSTOMER_REGISTERED")
							.title("Welcome to Finix Bank!")
							.message("Your account has been created. Please complete your KYC verification to activate your account.")
							.email(registrationDto.getEmail())
							.channels(List.of("EMAIL", "IN_APP"))
							.build();
					notificationProducer.send(event);
				} catch (Exception notifEx) {
					log.warn("Could not publish welcome notification to RabbitMQ: {}", notifEx.getMessage());
				}
			} else {
				Employee employee = mapper.map(registrationDto, Employee.class);
				employee.setUser(userEntity);
				employeeRepository.save(employee);
			}
		} catch (Exception ex) {
			return new ApiResponse("Failure", ex.getMessage());
		}
		
		return new ApiResponse("Succuss", "User Created Succussfully");
	}
	
}

package com.finix.beneficiary.service;

import com.finix.account.repository.AccountRepository;
import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.JwtDTO;
import com.finix.beneficiary.dto.BeneficiaryDTO;
import com.finix.beneficiary.entity.Beneficiary;
import com.finix.beneficiary.repository.BeneficiaryRepository;
import com.finix.common.exception.BusinessException;
import com.finix.customer.entity.Customer;
import com.finix.customer.repository.CustomerRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BeneficiaryServiceTest {

    @Mock
    private BeneficiaryRepository beneficiaryRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private AccountRepository accountRepository;

    @Spy
    private ModelMapper modelMapper = new ModelMapper();

    @InjectMocks
    private BeneficiaryServiceImpl beneficiaryService;

    private Customer mockCustomer;

    @BeforeEach
    void setUp() {
        mockCustomer = new Customer();
        mockCustomer.setCustomerId(100L);
        mockCustomer.setFirstName("Bob");

        JwtDTO jwt = new JwtDTO(100L, "CUSTOMER", "bob@finixbank.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(jwt, null, null));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("1. Add Beneficiary with valid inputs -> Successfully saves and returns DTO")
    void testAddBeneficiary_Success() {
        BeneficiaryDTO request = new BeneficiaryDTO();
        request.setBeneficiaryName("Rahul Sharma");
        request.setAccountNumber("123456789012");
        request.setIfscCode("FINX0000001");

        when(customerRepository.findById(100L)).thenReturn(Optional.of(mockCustomer));

        Beneficiary saved = new Beneficiary();
        saved.setBeneficiaryId(1L);
        saved.setCustomer(mockCustomer);
        saved.setBeneficiaryName("Rahul Sharma");
        saved.setAccountNumber("123456789012");
        saved.setIfscCode("FINX0000001");

        when(beneficiaryRepository.save(any(Beneficiary.class))).thenReturn(saved);

        ResponseEntity<?> response = beneficiaryService.addBeneficiary(request);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        verify(beneficiaryRepository, times(1)).save(any(Beneficiary.class));
    }

    @Test
    @DisplayName("2. Add Beneficiary with invalid account number -> Throws BusinessException")
    void testAddBeneficiary_InvalidAccountNumber_ThrowsBusinessException() {
        BeneficiaryDTO request = new BeneficiaryDTO();
        request.setBeneficiaryName("Rahul Sharma");
        request.setAccountNumber("123"); // Too short
        request.setIfscCode("FINX0000001");

        BusinessException ex = assertThrows(BusinessException.class, () -> {
            beneficiaryService.addBeneficiary(request);
        });

        assertTrue(ex.getMessage().contains("must be between 9 and 18"));
        verify(beneficiaryRepository, never()).save(any());
    }

    @Test
    @DisplayName("3. Get Beneficiaries when empty -> Returns empty list instead of 204")
    void testGetAllBeneficiaries_EmptyList_Returns200WithEmptyList() {
        when(customerRepository.findById(100L)).thenReturn(Optional.of(mockCustomer));
        when(beneficiaryRepository.findByCustomer(mockCustomer)).thenReturn(List.of());

        ResponseEntity<?> response = beneficiaryService.getAllBeneficiaries();

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        ApiResponse body = (ApiResponse) response.getBody();
        assertNotNull(body);
        List<?> list = (List<?>) body.getData();
        assertTrue(list.isEmpty());
    }

    @Test
    @DisplayName("4. Delete Beneficiary of customer -> Successfully deletes")
    void testDeleteBeneficiary_Success() {
        Beneficiary beneficiary = new Beneficiary();
        beneficiary.setBeneficiaryId(5L);
        beneficiary.setCustomer(mockCustomer);

        when(customerRepository.findById(100L)).thenReturn(Optional.of(mockCustomer));
        when(beneficiaryRepository.findById(5L)).thenReturn(Optional.of(beneficiary));

        ResponseEntity<?> response = beneficiaryService.deleteBeneficiary(5L);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        verify(beneficiaryRepository, times(1)).deleteById(5L);
    }
}

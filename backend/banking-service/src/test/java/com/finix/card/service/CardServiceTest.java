package com.finix.card.service;

import com.finix.account.entity.Account;
import com.finix.account.entity.AccountStatus;
import com.finix.account.entity.AccountType;
import com.finix.account.repository.AccountRepository;
import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.JwtDTO;
import com.finix.auth.entity.Role;
import com.finix.card.dto.CardRequestDTO;
import com.finix.card.dto.CardRequestDTO_GetCard;
import com.finix.card.dto.CardRequestDTO_PinChange;
import com.finix.card.entity.CardType;
import com.finix.card.entity.Cards;
import com.finix.card.entity.Status;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CardServiceTest {

    @Mock
    private CardRepository cardRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private AccountRepository accountRepository;

    @Spy
    private ModelMapper modelMapper = new ModelMapper();

    @InjectMocks
    private CardServiceImpl cardService;

    private Customer mockCustomer;
    private Account mockAccount;

    @BeforeEach
    void setUp() {
        mockCustomer = new Customer();
        mockCustomer.setCustomerId(100L);
        mockCustomer.setFirstName("Alice");
        mockCustomer.setLastName("Smith");

        mockAccount = Account.builder()
                .accountId(1L)
                .customer(mockCustomer)
                .accountNumber("123456789012")
                .accountType(AccountType.SAVINGS)
                .balance(BigDecimal.valueOf(10000))
                .status(AccountStatus.ACTIVE)
                .build();

        JwtDTO jwt = new JwtDTO(100L, "CUSTOMER", "alice@finixbank.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(jwt, null, null));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("1. Issue Card for Active Account -> Success with Masked Card Number")
    void testAddCard_Success() {
        CardRequestDTO request = new CardRequestDTO(AccountType.SAVINGS, CardType.DEBIT);

        when(customerRepository.findById(100L)).thenReturn(Optional.of(mockCustomer));
        when(accountRepository.findFirstByCustomerAndAccountTypeAndStatus(mockCustomer, AccountType.SAVINGS, AccountStatus.ACTIVE))
                .thenReturn(Optional.of(mockAccount));
        when(cardRepository.existsByAccountAndCardType(mockAccount, CardType.DEBIT)).thenReturn(false);
        when(cardRepository.existsByCardNum(any())).thenReturn(false);

        Cards savedCard = new Cards();
        savedCard.setCardId(10L);
        savedCard.setAccount(mockAccount);
        savedCard.setCardHolderName("Alice Smith");
        savedCard.setCardNum("4123456789012345");
        savedCard.setCardType(CardType.DEBIT);
        savedCard.setStatus(Status.ACTIVE);
        savedCard.setExpiryDate(LocalDateTime.now().plusYears(5));

        when(cardRepository.save(any(Cards.class))).thenReturn(savedCard);

        ResponseEntity<?> response = cardService.addCard(request);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        ApiResponse apiResp = (ApiResponse) response.getBody();
        assertNotNull(apiResp);
        CardRequestDTO_GetCard dto = (CardRequestDTO_GetCard) apiResp.getData();
        assertEquals("•••• •••• •••• 2345", dto.getCardNum()); // Masked PAN
        verify(cardRepository, times(1)).save(any(Cards.class));
    }

    @Test
    @DisplayName("2. Issue Card Without Active Account -> Throws BusinessException")
    void testAddCard_NoActiveAccount_ThrowsBusinessException() {
        CardRequestDTO request = new CardRequestDTO(AccountType.CURRENT, CardType.DEBIT);

        when(customerRepository.findById(100L)).thenReturn(Optional.of(mockCustomer));
        when(accountRepository.findFirstByCustomerAndAccountTypeAndStatus(mockCustomer, AccountType.CURRENT, AccountStatus.ACTIVE))
                .thenReturn(Optional.empty());
        when(accountRepository.findByCustomerAndAccountType(mockCustomer, AccountType.CURRENT))
                .thenReturn(null);

        BusinessException ex = assertThrows(BusinessException.class, () -> {
            cardService.addCard(request);
        });

        assertTrue(ex.getMessage().contains("You must have an active CURRENT account"));
        verify(cardRepository, never()).save(any());
    }

    @Test
    @DisplayName("3. Toggle Card Block -> Successfully updates status between ACTIVE and BLOCKED")
    void testToggleCardBlock_Success() {
        Cards card = new Cards();
        card.setCardId(10L);
        card.setAccount(mockAccount);
        card.setStatus(Status.ACTIVE);

        when(cardRepository.findById(10L)).thenReturn(Optional.of(card));

        ResponseEntity<?> response = cardService.toggleCardBlock(10L);

        assertNotNull(response);
        assertEquals(Status.BLOCKED, card.getStatus());
        verify(cardRepository, times(1)).save(card);
    }
}

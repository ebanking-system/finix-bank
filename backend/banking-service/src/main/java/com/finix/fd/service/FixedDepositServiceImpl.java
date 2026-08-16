package com.finix.fd.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finix.account.entity.Account;
import com.finix.account.entity.AccountStatus;
import com.finix.account.entity.AccountType;
import com.finix.account.repository.AccountRepository;
import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.JwtDTO;
import com.finix.common.exception.BusinessException;
import com.finix.common.exception.ResourceNotFoundException;
import com.finix.customer.entity.Customer;
import com.finix.customer.repository.CustomerRepository;
import com.finix.fd.dto.FDRequestDTO;
import com.finix.fd.dto.FDResponseDTO;
import com.finix.fd.entity.FixedDeposits;
import com.finix.fd.entity.Status;
import com.finix.fd.entity.Tenure;
import com.finix.fd.repository.FixedDepositRepository;
import com.finix.transaction.entity.Transaction;
import com.finix.transaction.entity.TransactionStatus;
import com.finix.transaction.entity.TransactionType;
import com.finix.transaction.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class FixedDepositServiceImpl implements FixedDepositService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final FixedDepositRepository fixedDepositRepository;
    private final TransactionRepository transactionRepository;
	private final ModelMapper mapper;

    @Override
    public ResponseEntity<?> createFD(FDRequestDTO request) {

        if (request == null || request.getAccountType() == null) {
            throw new BusinessException("Account type is mandatory.");
        }

        if (request.getDepositAmount() == null || request.getDepositAmount().compareTo(BigDecimal.valueOf(1000)) < 0) {
            throw new BusinessException("Minimum deposit amount for Fixed Deposit is ₹1,000.");
        }

        if (request.getTenureYears() == null) {
            throw new BusinessException("Deposit tenure is mandatory.");
        }

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
            throw new BusinessException("User is unauthenticated.");
        }

        JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
        Long customerId = jwt.getUserId();

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer profile not found."));

        Account account = accountRepository
                .findFirstByCustomerAndAccountTypeAndStatus(customer, request.getAccountType(), AccountStatus.ACTIVE)
                .orElse(accountRepository.findByCustomerAndAccountType(customer, request.getAccountType()));

        if (account == null) {
            throw new BusinessException("You do not have an active " + request.getAccountType() + " account to fund this Fixed Deposit. Please open an account first.");
        }

        if (account.getBalance() == null || account.getBalance().compareTo(request.getDepositAmount()) < 0) {
            BigDecimal currentBal = account.getBalance() != null ? account.getBalance() : BigDecimal.ZERO;
            throw new BusinessException("Insufficient balance in your " + request.getAccountType() + " account (Available: ₹" + currentBal + ", Required: ₹" + request.getDepositAmount() + ").");
        }

        // Debit the source account
        account.setBalance(account.getBalance().subtract(request.getDepositAmount()));

        FixedDeposits fd = new FixedDeposits();
        fd.setAccount(account);
        fd.setDepositAmount(request.getDepositAmount());

        double interestRate = getInterestRate(request.getTenureYears());
        fd.setInterestRate(interestRate);
        fd.setTenureYears(request.getTenureYears());

        LocalDateTime startDate = LocalDateTime.now();
        fd.setStartDate(startDate);

        int tenureYearsCount = request.getTenureYears().getMonths();
        LocalDateTime maturityDate = startDate.plusYears(tenureYearsCount);
        fd.setMaturityDate(maturityDate);

        BigDecimal interest = request.getDepositAmount()
                .multiply(BigDecimal.valueOf(interestRate))
                .multiply(BigDecimal.valueOf(tenureYearsCount))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        fd.setMaturityAmount(request.getDepositAmount().add(interest));
        fd.setStatus(Status.ACTIVE);

        accountRepository.save(account);
        FixedDeposits savedFd = fixedDepositRepository.save(fd);

        // Record immutable Transaction entry for the principal debit
        Transaction transaction = new Transaction();
        transaction.setFromAccount(account);
        transaction.setToAccount(null); // Term deposit booking
        transaction.setAmount(request.getDepositAmount());
        transaction.setTransactionType(TransactionType.DEPOSIT);
        transaction.setReferenceNumber("FD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        transaction.setStatus(TransactionStatus.SUCCESS);
        Long fdId = savedFd != null && savedFd.getFdId() != null ? savedFd.getFdId() : (fd.getFdId() != null ? fd.getFdId() : 1L);
        transaction.setRemarks("Fixed Deposit Booking (FD #" + fdId + " - " + request.getTenureYears() + " @" + interestRate + "%)");
        transactionRepository.save(transaction);

        return ResponseEntity.ok(new ApiResponse("success", "Fixed Deposit created successfully!"));
    }

    private double getInterestRate(Tenure tenure) {
        if (tenure == null) {
            return 6.5;
        }
        switch (tenure) {
            case ONE_YEAR:
                return 6.5;
            case TWO_YEARS:
                return 6.8;
            case THREE_YEARS:
                return 7.0;
            case FOUR_YEARS:
                return 7.2;
            case FIVE_YEARS:
                return 7.5;
            default:
                return 6.5;
        }
    }

	@Override
	public ResponseEntity<?> getFDDetails(AccountType accountType) {

	    Authentication authentication =
	            SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof JwtDTO)) {
            return ResponseEntity.ok(new ArrayList<>());
        }

	    JwtDTO jwt = (JwtDTO) authentication.getPrincipal();
	    Long customerId = jwt.getUserId();

	    Customer customer = customerRepository.findById(customerId)
	            .orElse(null);

        if (customer == null) {
            return ResponseEntity.ok(new ArrayList<>());
        }

	    Account account = accountRepository
                .findFirstByCustomerAndAccountTypeAndStatus(customer, accountType, AccountStatus.ACTIVE)
                .orElse(accountRepository.findByCustomerAndAccountType(customer, accountType));

        if (account == null) {
            return ResponseEntity.ok(new ArrayList<>());
        }

	    List<FixedDeposits> fdList = fixedDepositRepository.findByAccount(account);
	    List<FDResponseDTO> fdResponseList = fdList.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

	    return ResponseEntity.ok(fdResponseList);
	}

    @Override
    public ResponseEntity<?> getAllFDs() {
        List<FixedDeposits> fdList = fixedDepositRepository.findAllByOrderByStartDateDesc();
        List<FDResponseDTO> dtoList = fdList.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse("success", dtoList));
    }

    private FDResponseDTO mapToDto(FixedDeposits fd) {
        FDResponseDTO dto = new FDResponseDTO();
        dto.setFdId(fd.getFdId());
        dto.setDepositAmount(fd.getDepositAmount());
        dto.setInterestRate(fd.getInterestRate());
        dto.setTenureYears(fd.getTenureYears());
        dto.setStartDate(fd.getStartDate());
        dto.setMaturityDate(fd.getMaturityDate());
        dto.setMaturityAmount(fd.getMaturityAmount());
        dto.setStatus(fd.getStatus());

        if (fd.getAccount() != null) {
            dto.setAccountType(fd.getAccount().getAccountType());
            dto.setAccountNumber(fd.getAccount().getAccountNumber());
            if (fd.getAccount().getCustomer() != null) {
                Customer c = fd.getAccount().getCustomer();
                dto.setCustomerId(c.getCustomerId());
                String name = Stream.of(c.getFirstName(), c.getMiddleName(), c.getLastName())
                        .filter(n -> n != null && !n.isBlank())
                        .collect(Collectors.joining(" "));
                dto.setCustomerName(name.isBlank() ? "Customer #" + c.getCustomerId() : name);
            }
        }
        return dto;
    }

}

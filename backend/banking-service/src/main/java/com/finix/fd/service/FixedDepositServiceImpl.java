package com.finix.fd.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finix.account.entity.Account;
import com.finix.account.entity.AccountType;
import com.finix.account.repository.AccountRepository;
import com.finix.auth.dto.JwtDTO;
import com.finix.common.exception.ResourceNotFoundException;
import com.finix.customer.entity.Customer;
import com.finix.customer.repository.CustomerRepository;
import com.finix.fd.dto.FDRequestDTO;
import com.finix.fd.dto.FDResponseDTO;
import com.finix.fd.entity.FixedDeposits;
import com.finix.fd.entity.Status;
import com.finix.fd.entity.Tenure;
import com.finix.fd.repository.FixedDepositRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class FixedDepositServiceImpl implements FixedDepositService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final FixedDepositRepository fixedDepositRepository;
	private final ModelMapper mapper;

    @Override
    public ResponseEntity<?> createFD(FDRequestDTO request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        JwtDTO jwt = (JwtDTO) authentication.getPrincipal();

        Long customerId = jwt.getUserId();

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer not found"));

        Account account = accountRepository
                .findByCustomerAndAccountType(customer, request.getAccountType());

        if (account == null) {
            throw new ResourceNotFoundException("Account not found");
        }

        if (account.getBalance().compareTo(request.getDepositAmount()) < 0) {
            throw new RuntimeException("Insufficient Balance");
        }

        account.setBalance(account.getBalance().subtract(request.getDepositAmount()));

        FixedDeposits fd = new FixedDeposits();

        fd.setAccount(account);
        
        fd.setDepositAmount(request.getDepositAmount());

        double interestRate = getInterestRate(request.getTenureYears());

        fd.setInterestRate(interestRate);

        fd.setTenureYears(request.getTenureYears());

        LocalDateTime startDate = LocalDateTime.now();

        fd.setStartDate(startDate);

        LocalDateTime maturityDate =
                startDate.plusYears(request.getTenureYears().getMonths());

        fd.setMaturityDate(maturityDate);

        BigDecimal interest =
                (request.getDepositAmount().multiply(BigDecimal.valueOf(interestRate)).multiply(BigDecimal.valueOf(request.getTenureYears().getMonths()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP))); // 100;

        fd.setMaturityAmount(request.getDepositAmount().add(interest));

        fd.setStatus(Status.ACTIVE);

        accountRepository.save(account);

        fixedDepositRepository.save(fd);

        return ResponseEntity.ok("Fixed Deposit Created Successfully");
    }

    private double getInterestRate(Tenure tenure) {

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
                throw new IllegalArgumentException("Invalid Tenure");
        }
    }

	@Override
	public ResponseEntity<?> getFDDetails(AccountType accountType) {

	    Authentication authentication =
	            SecurityContextHolder.getContext().getAuthentication();

	    JwtDTO jwt = (JwtDTO) authentication.getPrincipal();

	    Long customerId = jwt.getUserId();

	    Customer customer = customerRepository.findById(customerId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException("Customer not found"));

	    Account account = accountRepository.findByCustomerAndAccountType(customer, accountType);

	    List<FixedDeposits> fdList = fixedDepositRepository.findByAccount(account);

	    List<FDResponseDTO> fdResponseList = new ArrayList<>();

	    for (FixedDeposits fd : fdList) {

	        FDResponseDTO dto = mapper.map(fd, FDResponseDTO.class);

	        dto.setAccountType(fd.getAccount().getAccountType());

	        fdResponseList.add(dto);
	    }

	    return ResponseEntity.ok(fdResponseList);
	}

}

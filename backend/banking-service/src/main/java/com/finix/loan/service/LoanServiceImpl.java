package com.finix.loan.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finix.customer.repository.CustomerRepository;
import com.finix.loan.dto.LoanRequestDto;
import com.finix.loan.dto.LoanResponseDto;
import com.finix.loan.dto.RejectLoanRequestDto;
import com.finix.loan.repository.LoanRepository;
import com.finix.loan.repository.LoanTypeRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.finix.account.entity.Account;
import com.finix.account.entity.AccountStatus;
import com.finix.account.entity.AccountType;
import com.finix.account.repository.AccountRepository;
import com.finix.auth.dto.ApiResponse;
import com.finix.customer.entity.Customer;
import com.finix.loan.entity.Loan;
import com.finix.loan.entity.LoanType;
import com.finix.loan.entity.LoanStatus;
import com.finix.auth.dto.JwtDTO;
import com.finix.transaction.entity.Transaction;
import com.finix.transaction.entity.TransactionStatus;
import com.finix.transaction.entity.TransactionType;
import com.finix.transaction.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class LoanServiceImpl implements LoanService {

    private final LoanRepository loanRepository;

    private final LoanTypeRepository loanTypeRepository;

    private final CustomerRepository customerRepository;

    private final ModelMapper mapper;
    
    private final EmiCalculatorService emiCalculatorService;
    
    private final AccountRepository accountRepository;

    private final TransactionRepository transactionRepository;
    
    private final EmiScheduleService emiScheduleService;


    //for customer to apply loan
    @Override
    public ResponseEntity<?> applyLoan(LoanRequestDto request) {

        // Get logged-in user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        JwtDTO jwt =
                (JwtDTO) authentication.getPrincipal();

        // Fetch customer
        Customer customer = customerRepository.findById(jwt.getUserId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Fetch loan type
        LoanType loanType = loanTypeRepository.findById(request.getLoanTypeId())
                .orElseThrow(() -> new RuntimeException("Loan type not found"));

        // Map DTO to Entity
        Loan loan = Loan.builder()
                .customer(customer)
                .loanType(loanType)
                .amount(request.getAmount())
                .tenureMonths(request.getTenureMonths())
                .remainingAmount(request.getAmount())
                .status(LoanStatus.UNDER_REVIEW)
                .build();

        // Save
        Loan savedLoan = loanRepository.save(loan);

        return ResponseEntity.ok(mapLoanResponse(savedLoan));
    }


    //For Customer to get his applied loans
    @Override
    public ResponseEntity<?> getMyLoans() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        JwtDTO jwt =
                (JwtDTO) authentication.getPrincipal();


        Customer customer =
                customerRepository.findById(jwt.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        List<Loan> loans = loanRepository.findByCustomer(customer);

        List<LoanResponseDto> response =
                loans.stream()
                     .map(this::mapLoanResponse)
                     .toList();

        return ResponseEntity.ok(response);
    }
    
    //For Employee to get all pending loans
    @Override
    public ResponseEntity<?> getPendingLoans() {

        List<Loan> loans =
                loanRepository.findByStatus(LoanStatus.UNDER_REVIEW);

        List<LoanResponseDto> response =
                loans.stream()
                     .map(this::mapLoanResponse)
                     .toList();

        return ResponseEntity.ok(response);

    }


    //approve loan by Employee
    @Override
    public ResponseEntity<?> approveLoan(Long loanId) {

        // Get logged-in employee
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        JwtDTO jwt =
                (JwtDTO) authentication.getPrincipal();

        // Find loan
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found"));

        // Loan must be under review
        if (loan.getStatus() != LoanStatus.UNDER_REVIEW) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse("FAILED", "Loan is already processed."));
        }

        // Calculate EMI
        BigDecimal emi = emiCalculatorService.calculateEmi(loan);

        // Update loan details
        loan.setStatus(LoanStatus.APPROVED);
        loan.setApprovalDate(LocalDateTime.now());
        loan.setApprovedBy(jwt.getUserId());
        loan.setEmi(emi);
        loan.setRemainingAmount(loan.getAmount());

        // Save
        Loan savedLoan = loanRepository.save(loan);

        return ResponseEntity.ok(mapLoanResponse(savedLoan));
    }


    //Loan rejection
    @Override
    public ResponseEntity<?> rejectLoan(Long loanId,
                                        RejectLoanRequestDto request) {

        // Get logged-in employee
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        JwtDTO jwt =
                (JwtDTO) authentication.getPrincipal();

        // Find Loan
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() ->
                        new RuntimeException("Loan not found"));

        // Loan should be pending
        if (loan.getStatus() != LoanStatus.UNDER_REVIEW) {

            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "Loan is already processed."));
        }

        // Update loan
        loan.setStatus(LoanStatus.REJECTED);
        loan.setRejectedBy(jwt.getUserId());
        loan.setRejectionDate(LocalDateTime.now());
        loan.setRejectionReason(request.getRejectionReason());

        Loan savedLoan = loanRepository.save(loan);

        return ResponseEntity.ok(mapLoanResponse(savedLoan));
    }


    //disburse loan to customer
    @Override
    public ResponseEntity<?> disburseLoan(Long loanId) {

        // Logged-in employee
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        JwtDTO jwt =
                (JwtDTO) authentication.getPrincipal();

        // Find Loan
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() ->
                        new RuntimeException("Loan not found"));

        // Loan must be approved
        if (loan.getStatus() != LoanStatus.APPROVED) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "Only approved loans can be disbursed."));
        }

        // Find customer's savings account
        Account account = accountRepository.findByCustomerAndAccountType(
                loan.getCustomer(),
                AccountType.SAVINGS);

        if (account == null) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "Customer does not have a Savings Account."));
        }

        // Account must be active
        if (account.getStatus() != AccountStatus.ACTIVE) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "Customer account is not active."));
        }

        // Credit loan amount
        account.setBalance(
                account.getBalance().add(loan.getAmount()));

        accountRepository.save(account);

        // Create transaction
        Transaction transaction = new Transaction();

        transaction.setFromAccount(null);

        transaction.setToAccount(account);

        transaction.setAmount(loan.getAmount());

        transaction.setTransactionType(TransactionType.LOAN_DISBURSEMENT);

        transaction.setReferenceNumber(UUID.randomUUID().toString());

        transaction.setRemarks("Loan Disbursed");

        transaction.setStatus(TransactionStatus.SUCCESS);

        transactionRepository.save(transaction);

        // Activate loan
        loan.setStatus(LoanStatus.ACTIVE);

        LocalDateTime now = LocalDateTime.now();

        loan.setStartDate(now);
        loan.setDisbursedDate(now);
        loan.setEndDate(now.plusMonths(loan.getTenureMonths()));

        loanRepository.save(loan);
        
        emiScheduleService.generateSchedule(loan);

        return ResponseEntity.ok(mapLoanResponse(loan));
    }
    
    
    // ================= Helper Method =================
    private LoanResponseDto mapLoanResponse(Loan loan) {

        LoanResponseDto dto =
                mapper.map(loan, LoanResponseDto.class);

        dto.setLoanType(loan.getLoanType().getLoanName());

        dto.setCustomerId(loan.getCustomer().getCustomerId());

        dto.setCustomerName(
                loan.getCustomer().getFirstName()
                + " "
                + loan.getCustomer().getLastName());

        dto.setMobile(loan.getCustomer().getMobile());

        return dto;
    }
    
    

}
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
import com.finix.employee.entity.Department;
import com.finix.employee.entity.Designation;
import com.finix.kyc.entity.KycDocuments;
import com.finix.kyc.entity.Status;
import com.finix.kyc.repository.KycDocumentRepository;
import com.finix.loan.dto.DefaultedLoanResponseDto;
import com.finix.loan.dto.LoanRepaymentResponseDto;
import com.finix.loan.dto.LoanRequestDto;
import com.finix.loan.dto.LoanResponseDto;
import com.finix.loan.dto.PayEmiRequestDto;
import com.finix.loan.dto.RejectLoanRequestDto;
import com.finix.loan.repository.LoanRepaymentRepository;
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
import com.finix.loan.entity.LoanRepayment;
import com.finix.loan.entity.LoanType;
import com.finix.loan.entity.RepaymentStatus;
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

	private final TransactionRepository transactionRepository;

	private final EmiScheduleService emiScheduleService;

	private final LoanRepaymentRepository loanRepaymentRepository;

	private final EmiCalculatorService emiCalculatorService;

	private final AccountRepository accountRepository;
	
	private final KycDocumentRepository kycDocumentRepository;
	
	private final AuthorizationServiceImpl authorizationServiceImpl;


	// for customer to apply loan
	@Override
	public ResponseEntity<?> applyLoan(LoanRequestDto request) {

		// Get logged-in user
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();

		// Fetch customer
		Customer customer = customerRepository.findById(jwt.getUserId())
				.orElseThrow(() -> new RuntimeException("Customer not found"));

		KycDocuments kyc =
		        kycDocumentRepository.findByCustomer(customer);

		if (kyc == null) {

		    return ResponseEntity.badRequest()
		            .body(new ApiResponse(
		                    "FAILED",
		                    "Please complete KYC before applying for a loan."));
		}
		
		if (kyc.getStatus() != Status.APPROVED) {

		    return ResponseEntity.badRequest()
		            .body(new ApiResponse(
		                    "FAILED",
		                    "Your KYC is not approved."));
		}
		
		if (loanRepository.existsByCustomerAndStatus(customer, LoanStatus.DEFAULTED)) {

		    return ResponseEntity.badRequest()
		            .body(new ApiResponse(
		                    "FAILED",
		                    "You have defaulted on a previous loan. Please contact the bank."));
		}
		
		List<LoanStatus> blockedStatuses = List.of(
		        LoanStatus.UNDER_REVIEW,
		        LoanStatus.APPROVED,
		        LoanStatus.ACTIVE);

		if (loanRepository.existsByCustomerAndStatusIn(customer, blockedStatuses)) {

		    return ResponseEntity.badRequest()
		            .body(new ApiResponse(
		                    "FAILED",
		                    "You already have a loan that is not yet closed."));
		}
		
		Account savingsAccount =
		        accountRepository.findByCustomerAndAccountType(
		                customer,
		                AccountType.SAVINGS);

		if (savingsAccount == null) {

		    return ResponseEntity.badRequest()
		            .body(new ApiResponse(
		                    "FAILED",
		                    "Savings account not found."));
		}
		// Fetch loan type
		LoanType loanType = loanTypeRepository.findById(request.getLoanTypeId())
				.orElseThrow(() -> new RuntimeException("Loan type not found"));
		
		if (request.getAmount().compareTo(loanType.getMinAmount()) < 0 ||
			    request.getAmount().compareTo(loanType.getMaxAmount()) > 0) {

			    return ResponseEntity.badRequest()
			            .body(new ApiResponse(
			                    "FAILED",
			                    "Loan amount must be between ₹" +
			                    loanType.getMinAmount() +
			                    " and ₹" +
			                    loanType.getMaxAmount()));
			}
		
		if (request.getTenureMonths() < loanType.getMinTenureMonths() ||
			    request.getTenureMonths() > loanType.getMaxTenureMonths()) {

			    return ResponseEntity.badRequest()
			            .body(new ApiResponse(
			                    "FAILED",
			                    "Loan tenure must be between " +
			                    loanType.getMinTenureMonths() +
			                    " and " +
			                    loanType.getMaxTenureMonths() +
			                    " months."));
			}

		// Map DTO to Entity
		Loan loan = Loan.builder().customer(customer).loanType(loanType).amount(request.getAmount())
				.tenureMonths(request.getTenureMonths()).remainingAmount(request.getAmount())
				.status(LoanStatus.UNDER_REVIEW).build();

		// Save
		Loan savedLoan = loanRepository.save(loan);

		return ResponseEntity.ok(mapLoanResponse(savedLoan));
	}

	// For Customer to get his applied loans
	@Override
	public ResponseEntity<?> getMyLoans() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();

		Customer customer = customerRepository.findById(jwt.getUserId())
				.orElseThrow(() -> new RuntimeException("Customer not found"));

		List<Loan> loans = loanRepository.findByCustomer(customer);

		List<LoanResponseDto> response = loans.stream().map(this::mapLoanResponse).toList();

		return ResponseEntity.ok(response);
	}

	// For Employee to get all pending loans
	@Override
	public ResponseEntity<?> getPendingLoans() {

		List<Loan> loans = loanRepository.findByStatus(LoanStatus.UNDER_REVIEW);

		List<LoanResponseDto> response = loans.stream().map(this::mapLoanResponse).toList();

		return ResponseEntity.ok(response);

	}

	// approve loan by Employee
	@Override
	public ResponseEntity<?> approveLoan(Long loanId) {

    	authorizationServiceImpl.authorize(
    	        Department.LOANS,
    	        Designation.LOAN_OFFICER);
		// Get logged-in employee
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();

		// Find loan
		Loan loan = loanRepository.findById(loanId).orElseThrow(() -> new RuntimeException("Loan not found"));

		// Loan must be under review
		if (loan.getStatus() != LoanStatus.UNDER_REVIEW) {
			return ResponseEntity.badRequest().body(new ApiResponse("FAILED", "Loan is already processed."));
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

	// Loan rejection
	@Override
	public ResponseEntity<?> rejectLoan(Long loanId, RejectLoanRequestDto request) {

    	authorizationServiceImpl.authorize(
    	        Department.LOANS,
    	        Designation.LOAN_OFFICER);
		// Get logged-in employee
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();

		// Find Loan
		Loan loan = loanRepository.findById(loanId).orElseThrow(() -> new RuntimeException("Loan not found"));

		// Loan should be pending
		if (loan.getStatus() != LoanStatus.UNDER_REVIEW) {

			return ResponseEntity.badRequest().body(new ApiResponse("FAILED", "Loan is already processed."));
		}

		// Update loan
		loan.setStatus(LoanStatus.REJECTED);
		loan.setRejectedBy(jwt.getUserId());
		loan.setRejectionDate(LocalDateTime.now());
		loan.setRejectionReason(request.getRejectionReason());

		Loan savedLoan = loanRepository.save(loan);

		return ResponseEntity.ok(mapLoanResponse(savedLoan));
	}

	// disburse loan to customer
	@Override
	public ResponseEntity<?> disburseLoan(Long loanId) {

    	authorizationServiceImpl.authorize(
    	        Department.LOANS,
    	        Designation.LOAN_OFFICER);
    	
		// Logged-in employee
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		JwtDTO jwt = (JwtDTO) authentication.getPrincipal();

		// Find Loan
		Loan loan = loanRepository.findById(loanId).orElseThrow(() -> new RuntimeException("Loan not found"));

		// Loan must be approved
		if (loan.getStatus() != LoanStatus.APPROVED) {
			return ResponseEntity.badRequest().body(new ApiResponse("FAILED", "Only approved loans can be disbursed."));
		}

		// Find customer's savings account
		Account account = accountRepository.findByCustomerAndAccountType(loan.getCustomer(), AccountType.SAVINGS);
		
		// Find Internal Bank Account
		Account bankAccount = accountRepository
		        .findByAccountNumber("000000000000")
		        .orElseThrow(() ->
		                new RuntimeException("Internal Bank Account not found"));

		if (account == null) {
			return ResponseEntity.badRequest()
					.body(new ApiResponse("FAILED", "Customer does not have a Savings Account."));
		}

		// Account must be active
		if (account.getStatus() != AccountStatus.ACTIVE) {
			return ResponseEntity.badRequest().body(new ApiResponse("FAILED", "Customer account is not active."));
		}
		
		// Internal account must be active
		if (bankAccount.getStatus() != AccountStatus.ACTIVE) {
		    return ResponseEntity.badRequest()
		            .body(new ApiResponse(
		                    "FAILED",
		                    "Internal Bank Account is not active."));
		}
		// Debit Internal Bank Account
		bankAccount.setBalance(
		        bankAccount.getBalance().subtract(loan.getAmount()));

		// Credit Customer Account
		account.setBalance(
		        account.getBalance().add(loan.getAmount()));

		// Save both accounts
		accountRepository.save(bankAccount);
		accountRepository.save(account);

		// Create transaction
		Transaction transaction = new Transaction();

		transaction.setFromAccount(bankAccount);

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

		LoanResponseDto dto = mapper.map(loan, LoanResponseDto.class);

		dto.setLoanType(loan.getLoanType().getLoanName());

		dto.setCustomerId(loan.getCustomer().getCustomerId());

		dto.setCustomerName(loan.getCustomer().getFirstName() + " " + loan.getCustomer().getLastName());

		dto.setMobile(loan.getCustomer().getMobile());

        return dto;
    }


    @Override
    public ResponseEntity<?> getRepayments(Long loanId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        JwtDTO jwt =
                (JwtDTO) authentication.getPrincipal();

        Customer customer =
                customerRepository.findById(jwt.getUserId())
                        .orElseThrow(() ->
                                new RuntimeException("Customer not found"));

        Loan loan =
                loanRepository.findById(loanId)
                        .orElseThrow(() ->
                                new RuntimeException("Loan not found"));

        // Customer can only view their own loan
        if (!loan.getCustomer().getCustomerId()
                .equals(customer.getCustomerId())) {

            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "You are not authorized to view this loan."));
        }

        List<LoanRepayment> repayments =
                loanRepaymentRepository
                        .findByLoanOrderByEmiNumberAsc(loan);

        List<LoanRepaymentResponseDto> response =
                repayments.stream()
                        .map(repayment ->
                                mapper.map(
                                        repayment,
                                        LoanRepaymentResponseDto.class))
                        .toList();

        return ResponseEntity.ok(response);
    }


    @Override
    public ResponseEntity<?> payEmi(Long repaymentId,
                                    PayEmiRequestDto request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        JwtDTO jwt =
                (JwtDTO) authentication.getPrincipal();

        Customer customer =
                customerRepository.findById(jwt.getUserId())
                        .orElseThrow(() ->
                                new RuntimeException("Customer not found"));
        
        Account bankAccount = accountRepository
                .findByAccountNumber("000000000000")
                .orElseThrow(() ->
                        new RuntimeException("Internal Bank Account not found"));

        // Find repayment
        LoanRepayment repayment =
                loanRepaymentRepository.findById(repaymentId)
                        .orElseThrow(() ->
                                new RuntimeException("Repayment not found"));

        Loan loan = repayment.getLoan();
        
        List<LoanRepayment> repayments =
                loanRepaymentRepository.findByLoanOrderByEmiNumberAsc(loan);
        
        LoanRepayment nextUnpaid = repayments.stream()
                .filter(r -> r.getStatus() != RepaymentStatus.PAID)
                .findFirst()
                .orElse(null);

        if (nextUnpaid != null &&
            !nextUnpaid.getRepaymentId().equals(repayment.getRepaymentId())) {

            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "Please pay EMI #" +
                            nextUnpaid.getEmiNumber() +
                            " first."));
        }

//        if (!pendingRepayments.isEmpty()) {
//
//            LoanRepayment nextPendingEmi = pendingRepayments.get(0);
//
//            if (!nextPendingEmi.getRepaymentId()
//                    .equals(repayment.getRepaymentId())) {
//
//                return ResponseEntity.badRequest()
//                        .body(new ApiResponse(
//                                "FAILED",
//                                "Please pay EMI #" +
//                                nextPendingEmi.getEmiNumber() +
//                                " first."));
//            }
//        }

        // Verify ownership
        if (!loan.getCustomer().getCustomerId()
                .equals(customer.getCustomerId())) {

            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "You are not authorized to pay this EMI."));
        }

        // Already paid?
        if (repayment.getStatus() == RepaymentStatus.PAID) {

            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "EMI already paid."));
        }

     // Loan should be ACTIVE or DEFAULTED
        if (loan.getStatus() != LoanStatus.ACTIVE &&
            loan.getStatus() != LoanStatus.DEFAULTED) {

            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "Loan cannot accept EMI payments."));
        }

        // Customer account
        Account account =
                accountRepository.findByCustomerAndAccountType(
                        customer,
                        request.getAccountType());

        if (account == null) {

            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "Account not found."));
        }

        // Account active
        if (account.getStatus() != AccountStatus.ACTIVE) {

            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "Account is not active."));
        }

        // Balance check
        if (account.getBalance()
                .compareTo(repayment.getAmountDue()) < 0) {

            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "Insufficient balance."));
        }
        
        if (bankAccount.getStatus() != AccountStatus.ACTIVE) {

            return ResponseEntity.badRequest()
                    .body(new ApiResponse(
                            "FAILED",
                            "Internal Bank Account is not active."));
        }
        
     // Debit Customer Account
        account.setBalance(
                account.getBalance()
                        .subtract(repayment.getAmountDue()));

        // Credit Internal Bank Account
        bankAccount.setBalance(
                bankAccount.getBalance()
                        .add(repayment.getAmountDue()));

        accountRepository.save(account);
        accountRepository.save(bankAccount);

        // Update repayment
        repayment.setAmountPaid(repayment.getAmountDue());
        repayment.setPaymentDate(LocalDateTime.now());
        repayment.setStatus(RepaymentStatus.PAID);

        loanRepaymentRepository.save(repayment);
        
        //when all overdues are cleard then change the status to ACTIVE
        long overdueCount =
                loanRepaymentRepository.countByLoanAndStatus(
                        loan,
                        RepaymentStatus.OVERDUE);

        if (loan.getStatus() == LoanStatus.DEFAULTED &&
            overdueCount == 0) {

            loan.setStatus(LoanStatus.ACTIVE);
        }

        // Update loan remaining amount
        loan.setRemainingAmount(
                loan.getRemainingAmount()
                        .subtract(repayment.getAmountDue()));

        // Close loan if fully paid
        if (loan.getRemainingAmount()
                .compareTo(BigDecimal.ZERO) <= 0) {

            loan.setRemainingAmount(BigDecimal.ZERO);
            loan.setStatus(LoanStatus.CLOSED);
        }

        loanRepository.save(loan);

        // Create transaction
        Transaction transaction = new Transaction();

        transaction.setFromAccount(account);
        transaction.setToAccount(bankAccount);

        transaction.setAmount(repayment.getAmountDue());

        transaction.setTransactionType(
                TransactionType.LOAN_REPAYMENT);

        transaction.setReferenceNumber(
                UUID.randomUUID().toString());

        transaction.setRemarks(
                "Loan EMI Payment");

        transaction.setStatus(
                TransactionStatus.SUCCESS);

        transactionRepository.save(transaction);

        return ResponseEntity.ok(
                new ApiResponse(
                        "SUCCESS",
                        "EMI paid successfully."));
	}

    @Override
    public ResponseEntity<?> getDefaultedLoans() {

    	authorizationServiceImpl.authorize(
                Department.LOANS,
                Designation.LOAN_OFFICER);

        List<Loan> loans =
                loanRepository.findByStatus(LoanStatus.DEFAULTED);

        List<DefaultedLoanResponseDto> response =
                loans.stream()
                        .map(loan -> {

                            DefaultedLoanResponseDto dto =
                                    new DefaultedLoanResponseDto();

                            dto.setLoanId(loan.getLoanId());

                            dto.setCustomerId(
                                    loan.getCustomer().getCustomerId());

                            dto.setCustomerName(
                                    loan.getCustomer().getFirstName() +
                                    " " +
                                    loan.getCustomer().getLastName());

                            dto.setMobile(
                                    loan.getCustomer().getMobile());

                            dto.setLoanType(
                                    loan.getLoanType().getLoanName());

                            dto.setLoanAmount(
                                    loan.getAmount());

                            dto.setRemainingAmount(
                                    loan.getRemainingAmount());

                            dto.setStatus(
                                    loan.getStatus());

                            dto.setOverdueEmis(
                                    (int) loanRepaymentRepository
                                            .countByLoanAndStatus(
                                                    loan,
                                                    RepaymentStatus.OVERDUE));

                            return dto;

                        })
                        .toList();

        return ResponseEntity.ok(response);
    }
    
    

}
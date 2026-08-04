package com.finix.loan.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.finix.loan.entity.Loan;
import com.finix.loan.entity.LoanRepayment;
import com.finix.loan.entity.LoanStatus;
import com.finix.loan.entity.RepaymentStatus;
import com.finix.loan.repository.LoanRepaymentRepository;
import com.finix.loan.repository.LoanRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EmiScheduler {

	private final LoanRepaymentRepository loanRepaymentRepository;
	
	private final LoanRepository loanRepository;
	
    @Scheduled(cron = "0 0 0 * * ?")
//	@Scheduled(fixedRate = 30000)
    public void updateOverdueEmis() {

    	List<LoanRepayment> repayments =
    	        loanRepaymentRepository
    	                .findByStatusAndDueDateBefore(
    	                        RepaymentStatus.PENDING,
    	                        LocalDateTime.now());

    	System.out.println("Checking overdue EMIs...");
    	System.out.println("Found " + repayments.size() + " overdue EMI(s)");
    	if (repayments.isEmpty()) {
            System.out.println("No overdue EMIs found.");
        }

        for (LoanRepayment repayment : repayments) {

            repayment.setStatus(RepaymentStatus.OVERDUE);

            System.out.println(
                    "EMI #" + repayment.getEmiNumber() +
                    " marked as OVERDUE");
        }

        loanRepaymentRepository.saveAll(repayments);

        System.out.println(
                repayments.size() +
                " EMI(s) updated to OVERDUE.");
        
     // Check all active loans
        List<Loan> activeLoans =
                loanRepository.findByStatus(LoanStatus.ACTIVE);

        for (Loan loan : activeLoans) {

            long overdueCount =
                    loanRepaymentRepository.countByLoanAndStatus(
                            loan,
                            RepaymentStatus.OVERDUE);

            if (overdueCount >= 3 &&
                loan.getStatus() != LoanStatus.DEFAULTED) {

                loan.setStatus(LoanStatus.DEFAULTED);

                loanRepository.save(loan);

                System.out.println(
                        "Loan " +
                        loan.getLoanId() +
                        " marked as DEFAULTED.");
            }

        }

    }
	
	

}
package com.finix.loan.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finix.loan.entity.Loan;
import com.finix.loan.entity.LoanRepayment;
import com.finix.loan.entity.RepaymentStatus;
import com.finix.loan.repository.LoanRepaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class EmiScheduleServiceImpl implements EmiScheduleService {

	private final LoanRepaymentRepository loanRepaymentRepository;
	
	@Override
	public void generateSchedule(Loan loan) {

	    List<LoanRepayment> repayments = new ArrayList<>();

	    LocalDateTime dueDate = loan.getStartDate().plusMonths(1);

	    for (int i = 1; i <= loan.getTenureMonths(); i++) {

	        LoanRepayment repayment = new LoanRepayment();

	        repayment.setLoan(loan);
	        repayment.setEmiNumber(i);
	        repayment.setDueDate(dueDate);
	        repayment.setAmountDue(loan.getEmi());
	        repayment.setStatus(RepaymentStatus.PENDING);

	        repayments.add(repayment);

	        dueDate = dueDate.plusMonths(1);
	    }

	    loanRepaymentRepository.saveAll(repayments);
	}

}
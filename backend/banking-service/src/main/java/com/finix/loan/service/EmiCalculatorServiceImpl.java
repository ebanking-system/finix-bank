package com.finix.loan.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Service;

import com.finix.loan.entity.Loan;

@Service
public class EmiCalculatorServiceImpl implements EmiCalculatorService {

    @Override
    public BigDecimal calculateEmi(Loan loan) {

        BigDecimal principal = loan.getAmount();

        BigDecimal annualRate = loan.getLoanType().getInterestRate();

        BigDecimal years = BigDecimal.valueOf(loan.getTenureMonths())
                .divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);

        BigDecimal interest = principal
                .multiply(annualRate)
                .multiply(years)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal totalAmount = principal.add(interest);

        return totalAmount.divide(
                BigDecimal.valueOf(loan.getTenureMonths()),
                2,
                RoundingMode.HALF_UP);
    }
}
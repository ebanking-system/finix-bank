package com.finix.loan.service;

import java.math.BigDecimal;

import com.finix.loan.entity.Loan;

public interface EmiCalculatorService {

    BigDecimal calculateEmi(Loan loan);

}
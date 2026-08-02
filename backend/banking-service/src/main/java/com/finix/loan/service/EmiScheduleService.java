package com.finix.loan.service;

import com.finix.loan.entity.Loan;

public interface EmiScheduleService {

    void generateSchedule(Loan loan);

}
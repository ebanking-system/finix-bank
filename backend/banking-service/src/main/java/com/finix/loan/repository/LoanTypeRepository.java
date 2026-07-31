package com.finix.loan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.finix.loan.entity.LoanType;

@Repository
public interface LoanTypeRepository extends JpaRepository<LoanType, Integer>{

}

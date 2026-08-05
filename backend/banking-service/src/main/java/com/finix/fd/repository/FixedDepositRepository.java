package com.finix.fd.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.finix.fd.entity.FixedDeposits;

public interface FixedDepositRepository extends JpaRepository<FixedDeposits, Long> {

}

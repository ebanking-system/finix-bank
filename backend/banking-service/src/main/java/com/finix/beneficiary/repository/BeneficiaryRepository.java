package com.finix.beneficiary.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.finix.beneficiary.entity.Beneficiary;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {

}

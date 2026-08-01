package com.finix.kyc.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.finix.customer.entity.Customer;
import com.finix.kyc.entity.KycDocuments;


public interface KycDocumentRepository extends JpaRepository<KycDocuments, Long> {

	KycDocuments findByCustomer(Customer customer);

}

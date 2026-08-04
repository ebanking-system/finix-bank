package com.finix.kyc.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.finix.customer.entity.Customer;
import com.finix.kyc.entity.KycDocuments;
import com.finix.kyc.entity.Status;


public interface KycDocumentRepository extends JpaRepository<KycDocuments, Long> {

	KycDocuments findByCustomer(Customer customer);

	List<KycDocuments> findByStatus(Status status);

//	KycDocuments findByCustomerID(Long customerId);

}

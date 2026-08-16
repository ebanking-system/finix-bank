package com.finix.fd.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.finix.account.entity.Account;
import com.finix.fd.entity.FixedDeposits;

public interface FixedDepositRepository extends JpaRepository<FixedDeposits, Long> {

	List<FixedDeposits> findByAccount(Account account);

	List<FixedDeposits> findAllByOrderByStartDateDesc();
}

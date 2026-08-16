package com.finix.auth.repository;

import com.finix.auth.entity.AuditLog;
import com.finix.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByUserOrderByLogDateDesc(User user);

    List<AuditLog> findByActionContainingOrderByLogDateDesc(String action);
}

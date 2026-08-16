package com.finix.auth.service;

import com.finix.auth.entity.AuditLog;
import com.finix.auth.entity.User;
import com.finix.auth.repository.AuditLogRepository;
import com.finix.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(Long userId, String action, String description) {
        try {
            if (userId == null) {
                log.info("[AUDIT-ANONYMOUS] Action='{}', Description='{}'", action, description);
                return;
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                AuditLog auditLog = AuditLog.builder()
                        .user(user)
                        .action(action)
                        .description(description)
                        .logDate(LocalDateTime.now())
                        .build();

                auditLogRepository.save(auditLog);
                log.info("[AUDIT-TRAIL] User=#{} ({}), Action='{}', Description='{}'",
                        user.getUserId(), user.getEmail(), action, description);
            } else {
                log.warn("[AUDIT-WARN] User ID #{} not found in database for action '{}'", userId, action);
            }
        } catch (Exception e) {
            log.error("[AUDIT-ERROR] Failed to record audit log entry: {}", e.getMessage(), e);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logManagerOverride(Long managerUserId, String operation, String entityType, Long entityId, String details) {
        String action = "MANAGER_OVERRIDE_" + operation.toUpperCase();
        String description = String.format("Manager override on %s #%s. Details: %s",
                entityType, entityId != null ? entityId : "N/A", details != null ? details : "None");

        logAction(managerUserId, action, description);
    }
}

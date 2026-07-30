package com.ebs.auth.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @NotNull(message = "User is mandatory")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", nullable = false)
    private User user;

    @NotBlank(message = "Action is mandatory")
    @Column(name = "action", length = 100, nullable = false)
    private String action;

    @Column(name = "description", length = 500)
    private String description;

    @NotNull
    @Column(name = "log_date", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime logDate;

    @PrePersist
    public void prePersist() {
        if (logDate == null) {
            logDate = LocalDateTime.now();
        }
    }
}

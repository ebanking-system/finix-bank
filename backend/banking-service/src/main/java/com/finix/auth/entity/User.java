package com.finix.auth.entity;

import com.finix.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@ToString
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Email must be valid")
    @Column(name = "email", length = 150, unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Password hash is mandatory")
    @Column(name = "password_hash", length = 1024, nullable = false)
    private String passwordHash;

    @NotNull(message = "Role is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;
    
    @Column(name = "is_active", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean isActive = true;

    @Column(name = "must_change_password", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    @Builder.Default
    private Boolean mustChangePassword = false;
}
package com.ebs.account.entity;

import com.ebs.common.entity.meta.BaseEntity;
import com.ebs.customer.entity.Customer;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "accounts")
public class Account extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Long accountId;

    @NotNull(message = "Customer is mandatory")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", referencedColumnName = "customer_id", nullable = false)
    private Customer customer;

    @NotBlank(message = "Account number is mandatory")
    @Column(name = "account_number", length = 20, unique = true, nullable = false)
    private String accountNumber;

    @NotNull(message = "Account type is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private AccountType accountType;

    // BigDecimal, NOT double/float — money must never use binary floating point.
    @NotNull(message = "Balance is mandatory")
    @Column(name = "balance", precision = 19, scale = 4, nullable = false)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    @NotBlank(message = "IFSC code is mandatory")
    @Column(name = "ifsc_code", length = 20, nullable = false)
    private String ifscCode;

    @NotNull(message = "Status is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private AccountStatus status = AccountStatus.ACTIVE;
}

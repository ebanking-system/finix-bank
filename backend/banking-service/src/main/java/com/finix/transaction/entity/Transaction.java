package com.ebs.transaction.entity;

import com.ebs.account.entity.Account;
import com.ebs.common.entity.meta.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "transactions")
public class Transaction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long transactionId;

    // Nullable: a DEPOSIT has no source account, a WITHDRAWAL has no destination account
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_account_id", referencedColumnName = "account_id")
    private Account fromAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_account_id", referencedColumnName = "account_id")
    private Account toAccount;

    // BigDecimal, NOT double/float — same reasoning as Account.balance
    @NotNull(message = "Amount is mandatory")
    @Column(name = "amount", precision = 19, scale = 4, nullable = false)
    private BigDecimal amount;

    @NotNull(message = "Transaction type is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;

    @NotBlank(message = "Reference number is mandatory")
    @Column(name = "reference_number", length = 50, unique = true, nullable = false)
    private String referenceNumber;

    @Column(name = "remarks", length = 255)
    private String remarks;

    @NotNull(message = "Transaction date/time is mandatory")
    @Column(name = "transaction_date_time", nullable = false)
    private LocalDateTime transactionDateTime;

    @NotNull(message = "Status is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TransactionStatus status;

    @PrePersist
    public void prePersist() {
        if (transactionDateTime == null) {
            transactionDateTime = LocalDateTime.now();
        }
    }
}

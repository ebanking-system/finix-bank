package com.ebs.beneficiary.entity;

import com.ebs.common.entity.meta.BaseEntity;
import com.ebs.customer.entity.Customer;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "beneficiaries")
public class Beneficiary extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "beneficiary_id")
    private Long beneficiaryId;

    @NotNull(message = "Customer is mandatory")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", referencedColumnName = "customer_id", nullable = false)
    private Customer customer;

    @NotBlank(message = "Beneficiary name is mandatory")
    @Column(name = "beneficiary_name", length = 150, nullable = false)
    private String beneficiaryName;

    @NotBlank(message = "Account number is mandatory")
    @Column(name = "account_number", length = 20, nullable = false)
    private String accountNumber;

    @NotBlank(message = "IFSC code is mandatory")
    @Column(name = "ifsc_code", length = 20, nullable = false)
    private String ifscCode;
}

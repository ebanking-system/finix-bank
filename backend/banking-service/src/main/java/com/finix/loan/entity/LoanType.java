package com.finix.loan.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

//jakarta annotations
@Entity
@Table(name = "loan_types")
//lombok annotation
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class LoanType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "loan_type_id")
    private Integer loanTypeId;

    @NotBlank
    @Column(name = "loan_name",nullable = false, length = 100)
    private String loanName;

    @NotNull
    @Positive
    @Column(name = "interest_rate",nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;
    
    @OneToMany(mappedBy = "loanType",fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Loan> loans = new ArrayList<>();
}

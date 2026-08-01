package com.finix.loan.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "loan_types")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "loans")
@EqualsAndHashCode(exclude = "loans")
public class LoanType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "loan_type_id")
    private Long loanTypeId;

    @Column(name = "loan_name", nullable = false, length = 100)
    private String loanName;

    @Column(name = "interest_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;

    @OneToMany(mappedBy = "loanType", fetch = FetchType.LAZY)
    private List<Loan> loans = new ArrayList<>();
}
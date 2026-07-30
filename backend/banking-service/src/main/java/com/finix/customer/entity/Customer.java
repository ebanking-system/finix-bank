package com.ebs.customer.entity;

import com.ebs.auth.entity.User;
import com.ebs.common.entity.meta.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "customers")
public class Customer extends BaseEntity {

    @Id
    @Column(name = "customer_id")
    private Long userId;

    @NotBlank(message = "First name is mandatory")
    @Column(name = "first_name", length = 100, nullable = false)
    private String firstName;

    @Column(name = "middle_name", length = 100)
    private String middleName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @NotNull(message = "Date of birth is mandatory")
    @Column(name = "dob", nullable = false)
    private LocalDate dob;

    @NotBlank(message = "Mobile number is mandatory")
    @Column(name = "mobile", length = 10, nullable = false)
    private String mobile;

    @Column(name = "address", length = 255)
    private String address;
}

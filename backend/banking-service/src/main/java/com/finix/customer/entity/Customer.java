package com.finix.customer.entity;

import com.finix.auth.entity.User;
import com.finix.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "customers")
public class Customer extends BaseEntity {

    @Id
    @JoinColumn(name = "customer_id")
    @MapsId
    @OneToOne
    private User user;

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
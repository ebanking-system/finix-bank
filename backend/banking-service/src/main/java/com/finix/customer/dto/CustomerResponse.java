package com.finix.customer.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerResponse {

    private Long customerId;

    private String email;

    private String firstName;

    private String middleName;

    private String lastName;

    private LocalDate dob;

    private String mobile;

    private String address;
}
package com.finix.customer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCustomerRequest {

    @NotBlank(message = "First name is mandatory")
    private String firstName;

    private String middleName;

    private String lastName;

    @NotBlank(message = "Mobile number is mandatory")
    private String mobile;

    private String address;
}
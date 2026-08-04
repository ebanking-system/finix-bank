package com.finix.employee.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateEmployeeRequest {

    @NotBlank(message = "First name is mandatory")
    private String firstName;

    private String middleName;

    private String lastName;
}
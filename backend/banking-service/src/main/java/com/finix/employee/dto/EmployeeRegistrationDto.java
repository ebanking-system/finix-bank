package com.finix.employee.dto;

import com.finix.employee.entity.Department;
import com.finix.employee.entity.Designation;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EmployeeRegistrationDto {

    @NotBlank(message = "Email can't be blank !!!")
    @Email(message = "Email is not well formed!!!!")
    private String email;

    @NotBlank(message = "Password is mandatory")
    private String passwordHash;

    @NotBlank(message = "First name is mandatory")
    private String firstName;

    private String middleName;

    private String lastName;

    @NotNull(message = "Department is mandatory")
    private Department department;

    @NotNull(message = "Designation is mandatory")
    private Designation designation;
}
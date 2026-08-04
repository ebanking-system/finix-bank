package com.finix.employee.dto;

import com.finix.employee.entity.Department;
import com.finix.employee.entity.Designation;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateEmployeeAssignmentRequest {

    @NotNull(message = "Department is mandatory")
    private Department department;

    @NotNull(message = "Designation is mandatory")
    private Designation designation;
}
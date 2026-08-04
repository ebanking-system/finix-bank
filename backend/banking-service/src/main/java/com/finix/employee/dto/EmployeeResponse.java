package com.finix.employee.dto;

import com.finix.employee.entity.Department;
import com.finix.employee.entity.Designation;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeResponse {

    private Long employeeId;

    private String email;

    private String firstName;

    private String middleName;

    private String lastName;

    private Department department;

    private Designation designation;
}
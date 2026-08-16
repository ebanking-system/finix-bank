package com.finix.employee.dto;

import com.finix.employee.entity.Department;
import com.finix.employee.entity.Designation;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {

    private Long employeeId;

    private String email;

    private String firstName;

    private String middleName;

    private String lastName;

    private Department department;

    private Designation designation;

    private String profilePhotoPath;
}
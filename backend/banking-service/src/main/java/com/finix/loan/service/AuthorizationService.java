package com.finix.loan.service;

import com.finix.employee.entity.Department;
import com.finix.employee.entity.Designation;

public interface AuthorizationService {

    void authorize(Department department,
                   Designation designation);

}
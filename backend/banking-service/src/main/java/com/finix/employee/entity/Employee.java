package com.ebs.employee.entity;

import com.ebs.auth.entity.User;
import com.ebs.common.entity.meta.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "employees")
public class Employee extends BaseEntity {

    @Id
    @Column(name = "employee_id")
    private Long userId;

    @NotBlank(message = "First name is mandatory")
    @Column(name = "first_name", length = 100, nullable = false)
    private String firstName;

    @Column(name = "middle_name", length = 100)
    private String middleName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @NotNull(message = "Department is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(name = "department", nullable = false)
    private Department department;

    @NotNull(message = "Designation is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(name = "designation", nullable = false)
    private Designation designation;
}

package com.finix.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeChangePasswordRequest {

    @NotBlank(message = "Current password is required.")
    private String currentPassword;

    @NotBlank(message = "New password is required.")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[@$!%*?&#]).{5,20}$",
        message = "Password must be 5-20 characters long, include at least one digit, one lowercase letter, and one special symbol (@$!%*?&#)."
    )
    private String newPassword;

    @NotBlank(message = "Confirm password is required.")
    private String confirmPassword;
}

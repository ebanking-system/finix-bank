package com.finix.employee.service;

import com.finix.auth.dto.ApiResponse;
import com.finix.auth.dto.JwtDTO;
import com.finix.auth.entity.Role;
import com.finix.auth.entity.User;
import com.finix.auth.repository.UserRepository;
import com.finix.common.exception.BusinessException;
import com.finix.employee.dto.EmployeeChangePasswordRequest;
import com.finix.employee.dto.EmployeeResponse;
import com.finix.employee.dto.UpdateEmployeeRequest;
import com.finix.employee.entity.Department;
import com.finix.employee.entity.Designation;
import com.finix.employee.entity.Employee;
import com.finix.employee.repository.EmployeeRepository;
import com.finix.util.FileStorageUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private FileStorageUtil fileStorageUtil;

    @Spy
    private ModelMapper modelMapper = new ModelMapper();

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private User mockUser;
    private Employee mockEmployee;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setUserId(50L);
        mockUser.setEmail("staff@finixbank.com");
        mockUser.setPasswordHash("hashed_old_pwd");
        mockUser.setRole(Role.EMPLOYEE);

        mockEmployee = new Employee();
        mockEmployee.setEmployeeId(50L);
        mockEmployee.setUser(mockUser);
        mockEmployee.setFirstName("Rahul");
        mockEmployee.setLastName("Verma");
        mockEmployee.setDepartment(Department.ACCOUNTS);
        mockEmployee.setDesignation(Designation.ACCOUNT_OFFICER);

        JwtDTO jwt = new JwtDTO(50L, "EMPLOYEE", "staff@finixbank.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(jwt, null, null));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("1. Update Employee Name -> Successfully updates firstName and lastName")
    void testUpdateMyProfile_Success() {
        UpdateEmployeeRequest request = new UpdateEmployeeRequest();
        request.setFirstName("Rahul");
        request.setMiddleName("Kumar");
        request.setLastName("Sharma");

        when(employeeRepository.findById(50L)).thenReturn(Optional.of(mockEmployee));

        ApiResponse response = employeeService.updateMyProfile(request);

        assertNotNull(response);
        assertEquals("success", response.getStatus());
        assertEquals("Kumar", mockEmployee.getMiddleName());
        assertEquals("Sharma", mockEmployee.getLastName());
        verify(employeeRepository, times(1)).save(mockEmployee);
    }

    @Test
    @DisplayName("2. Change Password with correct current password -> Successfully encodes and saves")
    void testChangePassword_Success() {
        EmployeeChangePasswordRequest request = new EmployeeChangePasswordRequest(
                "OldPass@123", "NewSecret@99", "NewSecret@99");

        when(userRepository.findById(50L)).thenReturn(Optional.of(mockUser));
        when(encoder.matches("OldPass@123", "hashed_old_pwd")).thenReturn(true);
        when(encoder.matches("NewSecret@99", "hashed_old_pwd")).thenReturn(false);
        when(encoder.encode("NewSecret@99")).thenReturn("hashed_new_pwd");

        ApiResponse response = employeeService.changePassword(request);

        assertNotNull(response);
        assertEquals("success", response.getStatus());
        assertEquals("hashed_new_pwd", mockUser.getPasswordHash());
        verify(userRepository, times(1)).save(mockUser);
    }

    @Test
    @DisplayName("3. Change Password with incorrect current password -> Throws BusinessException")
    void testChangePassword_IncorrectCurrentPassword_ThrowsBusinessException() {
        EmployeeChangePasswordRequest request = new EmployeeChangePasswordRequest(
                "WrongCurrentPass", "NewSecret@99", "NewSecret@99");

        when(userRepository.findById(50L)).thenReturn(Optional.of(mockUser));
        when(encoder.matches("WrongCurrentPass", "hashed_old_pwd")).thenReturn(false);

        BusinessException ex = assertThrows(BusinessException.class, () -> {
            employeeService.changePassword(request);
        });

        assertTrue(ex.getMessage().contains("Current password entered is incorrect"));
        verify(userRepository, never()).save(mockUser);
    }

    @Test
    @DisplayName("4. Change Password when new and confirm do not match -> Throws BusinessException")
    void testChangePassword_MismatchedConfirmPassword_ThrowsBusinessException() {
        EmployeeChangePasswordRequest request = new EmployeeChangePasswordRequest(
                "OldPass@123", "NewSecret@99", "DifferentSecret@99");

        BusinessException ex = assertThrows(BusinessException.class, () -> {
            employeeService.changePassword(request);
        });

        assertTrue(ex.getMessage().contains("do not match"));
        verify(userRepository, never()).save(mockUser);
    }
}

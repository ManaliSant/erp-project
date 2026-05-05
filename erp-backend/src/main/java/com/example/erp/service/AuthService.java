package com.example.erp.service;

import com.example.erp.dto.EmployeeResponse;
import com.example.erp.dto.LoginRequest;
import com.example.erp.dto.LoginResponse;
import com.example.erp.entity.Employee;
import com.example.erp.exception.BadRequestException;
import com.example.erp.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final EmployeeRepository employeeRepository;
    private final EmployeeUserDetailsService employeeUserDetailsService;
    private final JwtService jwtService;
    private final AuditService auditService;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        if (!authentication.isAuthenticated()) {
            throw new BadRequestException("Invalid email or password");
        }

        Employee employee = employeeRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("Employee not found"));

        UserDetails userDetails = employeeUserDetailsService.loadUserByUsername(request.email());
        String jwt = jwtService.generateToken(userDetails);

        auditService.log(
                employee.getEmail(),
                "LOGIN",
                "EMPLOYEE_ID:" + employee.getId(),
                "User logged in");

        return new LoginResponse(jwt, EmployeeResponse.from(employee));
    }
}
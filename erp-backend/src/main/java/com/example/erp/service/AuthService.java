package com.example.erp.service;

import com.example.erp.dto.LoginRequest;
import com.example.erp.dto.LoginResponse;
import com.example.erp.entity.Employee;
import com.example.erp.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
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

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        if (!authentication.isAuthenticated()) {
            throw new RuntimeException("Invalid email or password");
        }

        Employee employee = employeeRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        UserDetails userDetails = employeeUserDetailsService.loadUserByUsername(request.email());
        String jwt = jwtService.generateToken(userDetails);

        return new LoginResponse(jwt, employee);
    }
}
package com.example.erp.service;

import com.example.erp.dto.EmployeeResponse;
import com.example.erp.dto.ForgotPasswordRequest;
import com.example.erp.dto.LoginRequest;
import com.example.erp.dto.LoginResponse;
import com.example.erp.dto.ResetPasswordByTokenRequest;
import com.example.erp.entity.Employee;
import com.example.erp.exception.BadRequestException;
import com.example.erp.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final EmployeeRepository employeeRepository;
    private final EmployeeUserDetailsService employeeUserDetailsService;
    private final JwtService jwtService;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        if (request.email() == null || request.email().isBlank()) {
            throw new BadRequestException("Email is required");
        }

        if (request.password() == null || request.password().isBlank()) {
            throw new BadRequestException("Password is required");
        }

        String email = request.email().trim().toLowerCase();

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password()));

            if (!authentication.isAuthenticated()) {
                throw new BadRequestException("Invalid email or password");
            }

            Employee employee = employeeRepository.findByEmail(email)
                    .orElseThrow(() -> new BadRequestException("Invalid email or password"));

            UserDetails userDetails = employeeUserDetailsService.loadUserByUsername(email);
            String jwt = jwtService.generateToken(userDetails);

            auditService.log(
                    employee.getEmail(),
                    "LOGIN",
                    "EMPLOYEE_ID:" + employee.getId(),
                    "User logged in");

            return new LoginResponse(jwt, EmployeeResponse.from(employee));

        } catch (BadCredentialsException ex) {
            throw new BadRequestException("Invalid email or password");
        } catch (DisabledException ex) {
            throw new BadRequestException("Account is not active. Please contact admin.");
        }
    }

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        String genericMessage = "If the email exists, a password reset link has been generated.";

        if (request.email() == null || request.email().isBlank()) {
            return genericMessage;
        }

        String email = request.email().trim().toLowerCase();

        employeeRepository.findByEmail(email)
                .ifPresent(employee -> {
                    if (!"Active".equalsIgnoreCase(employee.getStatus())) {
                        return;
                    }

                    String token = UUID.randomUUID().toString();
                    LocalDateTime expiry = LocalDateTime.now().plusMinutes(15);

                    employee.setResetPasswordToken(token);
                    employee.setResetPasswordTokenExpiry(expiry);
                    employeeRepository.save(employee);

                    String resetLink = "http://localhost:5173/reset-password?token=" + token;

                    System.out.println("=================================================");
                    System.out.println("PASSWORD RESET LINK FOR " + employee.getEmail());
                    System.out.println(resetLink);
                    System.out.println("Expires at: " + expiry);
                    System.out.println("=================================================");

                    auditService.log(
                            employee.getEmail(),
                            "REQUEST_PASSWORD_RESET",
                            "EMPLOYEE_ID:" + employee.getId(),
                            "Password reset token generated");
                });

        return genericMessage;
    }

    @Transactional
    public String resetPasswordByToken(ResetPasswordByTokenRequest request) {
        if (request.token() == null || request.token().isBlank()) {
            throw new BadRequestException("Reset token is required");
        }

        if (request.newPassword() == null || request.newPassword().isBlank()) {
            throw new BadRequestException("New password is required");
        }

        if (request.newPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters");
        }

        Employee employee = employeeRepository.findByResetPasswordToken(request.token().trim())
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));

        if (employee.getResetPasswordTokenExpiry() == null ||
                employee.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {

            employee.setResetPasswordToken(null);
            employee.setResetPasswordTokenExpiry(null);
            employeeRepository.save(employee);

            throw new BadRequestException("Reset token has expired");
        }

        employee.setPassword(passwordEncoder.encode(request.newPassword()));
        employee.setResetPasswordToken(null);
        employee.setResetPasswordTokenExpiry(null);

        employeeRepository.save(employee);

        auditService.log(
                employee.getEmail(),
                "RESET_PASSWORD_BY_TOKEN",
                "EMPLOYEE_ID:" + employee.getId(),
                "Password reset completed using reset token");

        return "Password reset successfully";
    }
}
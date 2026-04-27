package com.example.erp.service;

import com.example.erp.dto.CreateEmployeeRequest;
import com.example.erp.entity.Employee;
import com.example.erp.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    private Employee getLoggedInEmployee(Authentication authentication) {
        String email = authentication.getName();

        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged-in employee not found"));
    }

    public List<Employee> getAllEmployeesForAdmin() {
        return employeeRepository.findAll();
    }

    public List<Employee> getMyTeam(Authentication authentication) {
        Employee manager = getLoggedInEmployee(authentication);

        if (!"MANAGER".equalsIgnoreCase(manager.getRole())) {
            throw new RuntimeException("Only managers can view team members");
        }

        return employeeRepository.findByManager(manager.getName());
    }

    public Employee getMyProfile(Authentication authentication) {
        return getLoggedInEmployee(authentication);
    }

    public Employee createEmployee(CreateEmployeeRequest request) {
        if (employeeRepository.findByEmail(request.email().toLowerCase()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        String role = request.role() == null ? "EMPLOYEE" : request.role().toUpperCase();

        Employee employee = Employee.builder()
                .employeeCode(request.employeeCode())
                .name(request.name())
                .email(request.email().toLowerCase())
                .password(passwordEncoder.encode(request.password()))
                .role(role)
                .department(request.department())
                .designation(request.designation())
                .manager(request.manager())
                .joinDate(request.joinDate())
                .leavesRemaining(request.leavesRemaining() == null ? 10 : request.leavesRemaining())
                .signedIn(false)
                .lastSignIn("")
                .lastSignOut("")
                .status(request.status() == null ? "Active" : request.status())
                .build();

        return employeeRepository.save(employee);
    }
}
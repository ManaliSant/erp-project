package com.example.erp.service;

import com.example.erp.dto.ChangePasswordRequest;
import com.example.erp.dto.CreateEmployeeRequest;
import com.example.erp.dto.EmployeeResponse;
import com.example.erp.dto.ResetPasswordRequest;
import com.example.erp.entity.Employee;
import com.example.erp.exception.BadRequestException;
import com.example.erp.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    private Employee getLoggedInEmployee(Authentication authentication) {
        String email = authentication.getName();

        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Logged-in employee not found"));
    }

    public List<EmployeeResponse> getAllEmployeesForAdmin() {
        return employeeRepository.findAll()
                .stream()
                .map(EmployeeResponse::from)
                .toList();
    }

    public Page<EmployeeResponse> getEmployeesPage(String search, Pageable pageable) {
        Page<Employee> employees;

        if (search == null || search.isBlank()) {
            employees = employeeRepository.findAll(pageable);
        } else {
            employees = employeeRepository
                    .findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrDepartmentContainingIgnoreCase(
                            search,
                            search,
                            search,
                            pageable);
        }

        return employees.map(EmployeeResponse::from);
    }

    public List<EmployeeResponse> getMyTeam(Authentication authentication) {
        Employee manager = getLoggedInEmployee(authentication);

        if (!"MANAGER".equalsIgnoreCase(manager.getRole())) {
            throw new BadRequestException("Only managers can view team members");
        }

        return employeeRepository.findByManager(manager.getName())
                .stream()
                .map(EmployeeResponse::from)
                .toList();
    }

    public EmployeeResponse getMyProfile(Authentication authentication) {
        return EmployeeResponse.from(getLoggedInEmployee(authentication));
    }

    public EmployeeResponse createEmployee(CreateEmployeeRequest request) {
        if (request.email() == null || request.email().isBlank()) {
            throw new BadRequestException("Email is required");
        }

        if (request.password() == null || request.password().isBlank()) {
            throw new BadRequestException("Password is required");
        }

        if (employeeRepository.findByEmail(request.email().toLowerCase()).isPresent()) {
            throw new BadRequestException("Email already exists");
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

        Employee savedEmployee = employeeRepository.save(employee);

        auditService.log(
                "SYSTEM",
                "CREATE_EMPLOYEE",
                "EMPLOYEE_ID:" + savedEmployee.getId(),
                "Created employee account for " + savedEmployee.getEmail());

        return EmployeeResponse.from(savedEmployee);
    }

    public EmployeeResponse adminResetPassword(Authentication authentication, Long employeeId,
            ResetPasswordRequest request) {
        if (request.newPassword() == null || request.newPassword().isBlank()) {
            throw new BadRequestException("New password is required");
        }

        if (request.newPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BadRequestException("Employee not found"));

        employee.setPassword(passwordEncoder.encode(request.newPassword()));

        Employee savedEmployee = employeeRepository.save(employee);

        auditService.log(
                authentication.getName(),
                "RESET_PASSWORD",
                "EMPLOYEE_ID:" + employeeId,
                "Admin reset password for " + employee.getEmail());

        return EmployeeResponse.from(savedEmployee);
    }

    public String changeOwnPassword(Authentication authentication, ChangePasswordRequest request) {
        Employee employee = getLoggedInEmployee(authentication);

        if (request.oldPassword() == null || request.oldPassword().isBlank()) {
            throw new BadRequestException("Old password is required");
        }

        if (request.newPassword() == null || request.newPassword().isBlank()) {
            throw new BadRequestException("New password is required");
        }

        if (request.newPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters");
        }

        if (!passwordEncoder.matches(request.oldPassword(), employee.getPassword())) {
            throw new BadRequestException("Old password is incorrect");
        }

        employee.setPassword(passwordEncoder.encode(request.newPassword()));
        employeeRepository.save(employee);

        auditService.log(
                employee.getEmail(),
                "CHANGE_OWN_PASSWORD",
                "SELF",
                "User changed own password");

        return "Password changed successfully";
    }
}
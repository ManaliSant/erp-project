package com.example.erp.service;

import com.example.erp.dto.ChangePasswordRequest;
import com.example.erp.dto.CreateEmployeeRequest;
import com.example.erp.dto.EmployeeResponse;
import com.example.erp.dto.ResetPasswordRequest;
import com.example.erp.dto.UpdateEmployeeStatusRequest;
import com.example.erp.entity.Employee;
import com.example.erp.exception.BadRequestException;
import com.example.erp.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    private static final Set<String> VALID_STATUSES = Set.of(
            "Active",
            "Inactive",
            "Resigned",
            "Terminated");

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

    public Page<EmployeeResponse> getEmployeesPage(String search, String status, Pageable pageable) {
        Page<Employee> employees;

        boolean hasSearch = search != null && !search.isBlank();
        boolean hasStatus = status != null && !status.isBlank() && !"All".equalsIgnoreCase(status);

        if (!hasSearch && !hasStatus) {
            employees = employeeRepository.findAll(pageable);
        } else if (!hasSearch) {
            employees = employeeRepository.findByStatusIgnoreCase(status, pageable);
        } else if (!hasStatus) {
            employees = employeeRepository
                    .findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrDepartmentContainingIgnoreCase(
                            search,
                            search,
                            search,
                            pageable);
        } else {
            employees = employeeRepository
                    .findByStatusIgnoreCaseAndNameContainingIgnoreCaseOrStatusIgnoreCaseAndEmailContainingIgnoreCaseOrStatusIgnoreCaseAndDepartmentContainingIgnoreCase(
                            status,
                            search,
                            status,
                            search,
                            status,
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

    @Transactional
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

    @Transactional
    public EmployeeResponse adminResetPassword(
            Authentication authentication,
            Long employeeId,
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

    @Transactional
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

    @Transactional
    public EmployeeResponse updateEmployeeStatus(
            Authentication authentication,
            Long employeeId,
            UpdateEmployeeStatusRequest request) {
        Employee admin = getLoggedInEmployee(authentication);

        if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
            throw new BadRequestException("Only admin can update employee status");
        }

        if (request.status() == null || request.status().isBlank()) {
            throw new BadRequestException("Status is required");
        }

        String newStatus = normalizeStatus(request.status());

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BadRequestException("Employee not found"));

        if (admin.getId().equals(employee.getId())) {
            throw new BadRequestException("Admin cannot change own status");
        }

        String oldStatus = employee.getStatus();

        if (newStatus.equalsIgnoreCase(oldStatus)) {
            return EmployeeResponse.from(employee);
        }

        employee.setStatus(newStatus);

        if (!"Active".equalsIgnoreCase(newStatus)) {
            employee.setSignedIn(false);
        }

        Employee savedEmployee = employeeRepository.save(employee);

        auditService.log(
                admin.getEmail(),
                "UPDATE_EMPLOYEE_STATUS",
                "EMPLOYEE_ID:" + employee.getId(),
                "Changed employee status from " + oldStatus + " to " + newStatus);

        return EmployeeResponse.from(savedEmployee);
    }

    private String normalizeStatus(String status) {
        String trimmed = status.trim();

        for (String validStatus : VALID_STATUSES) {
            if (validStatus.equalsIgnoreCase(trimmed)) {
                return validStatus;
            }
        }

        throw new BadRequestException("Invalid status. Allowed values: Active, Inactive, Resigned, Terminated");
    }
}
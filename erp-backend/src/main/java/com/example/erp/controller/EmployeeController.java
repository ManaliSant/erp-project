package com.example.erp.controller;

import com.example.erp.dto.ChangePasswordRequest;
import com.example.erp.dto.CreateEmployeeRequest;
import com.example.erp.dto.EmployeeResponse;
import com.example.erp.dto.ResetPasswordRequest;
import com.example.erp.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<EmployeeResponse> getEmployees() {
        return employeeService.getAllEmployeesForAdmin();
    }

    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<EmployeeResponse> getEmployeesPage(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return employeeService.getEmployeesPage(search, PageRequest.of(page, size));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public EmployeeResponse getMyProfile(Authentication authentication) {
        return employeeService.getMyProfile(authentication);
    }

    @GetMapping("/my-team")
    @PreAuthorize("hasRole('MANAGER')")
    public List<EmployeeResponse> getMyTeam(Authentication authentication) {
        return employeeService.getMyTeam(authentication);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public EmployeeResponse createEmployee(@RequestBody CreateEmployeeRequest request) {
        return employeeService.createEmployee(request);
    }

    @PatchMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public EmployeeResponse resetPassword(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody ResetPasswordRequest request) {
        return employeeService.adminResetPassword(authentication, id, request);
    }

    @PatchMapping("/me/change-password")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public Map<String, String> changeOwnPassword(
            Authentication authentication,
            @RequestBody ChangePasswordRequest request) {
        String message = employeeService.changeOwnPassword(authentication, request);
        return Map.of("message", message);
    }
}
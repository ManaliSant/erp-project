package com.example.erp.controller;

import com.example.erp.dto.CreateEmployeeRequest;
import com.example.erp.entity.Employee;
import com.example.erp.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Employee> getEmployees() {
        return employeeService.getAllEmployeesForAdmin();
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public Employee getMyProfile(Authentication authentication) {
        return employeeService.getMyProfile(authentication);
    }

    @GetMapping("/my-team")
    @PreAuthorize("hasRole('MANAGER')")
    public List<Employee> getMyTeam(Authentication authentication) {
        return employeeService.getMyTeam(authentication);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Employee createEmployee(@RequestBody CreateEmployeeRequest request) {
        return employeeService.createEmployee(request);
    }
}
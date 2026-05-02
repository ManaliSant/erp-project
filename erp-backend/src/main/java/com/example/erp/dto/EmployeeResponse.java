package com.example.erp.dto;

import com.example.erp.entity.Employee;

public record EmployeeResponse(
        Long id,
        String employeeCode,
        String name,
        String email,
        String role,
        String department,
        String designation,
        String manager,
        String joinDate,
        Integer leavesRemaining,
        Boolean signedIn,
        String lastSignIn,
        String lastSignOut,
        String status) {
    public static EmployeeResponse from(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getName(),
                employee.getEmail(),
                employee.getRole(),
                employee.getDepartment(),
                employee.getDesignation(),
                employee.getManager(),
                employee.getJoinDate(),
                employee.getLeavesRemaining(),
                employee.getSignedIn(),
                employee.getLastSignIn(),
                employee.getLastSignOut(),
                employee.getStatus());
    }
}
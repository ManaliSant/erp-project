package com.example.erp.dto;

public record CreateEmployeeRequest(
        String employeeCode,
        String name,
        String email,
        String password,
        String role,
        String department,
        String designation,
        String manager,
        String joinDate,
        Integer leavesRemaining,
        String status) {
}
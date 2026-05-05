package com.example.erp.dto;

public record LoginResponse(
        String token,
        EmployeeResponse user) {
}
package com.example.erp.dto;

import com.example.erp.entity.Employee;

public record LoginResponse(String token, Employee user) {
}
package com.example.erp.dto;

public record ApplicationRequest(
        Long employeeId,
        String employeeName,
        String type,
        String title,
        String description,
        String dateRange,
        Integer days) {
}
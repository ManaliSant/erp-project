package com.example.erp.dto;

public record ReviewRequest(
        String reviewedBy,
        String reviewComment) {
}
package com.example.erp.dto;

public record ChangePasswordRequest(
        String oldPassword,
        String newPassword) {
}
package com.example.erp.dto;

public record ResetPasswordByTokenRequest(
        String token,
        String newPassword) {
}
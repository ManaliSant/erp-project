package com.example.erp.dto;

public record DashboardStatsResponse(
        long totalEmployees,
        long totalAdmins,
        long totalManagers,
        long totalRegularEmployees,
        long signedInEmployees,
        long pendingApplications,
        long approvedApplications,
        long rejectedApplications,
        long generatedPdfs,
        long totalAuditLogs,
        long todayAttendanceCount,
        long activeAttendanceSessions,
        long totalAttendanceRecords,
        long totalWorkedMinutes,
        String totalWorkedHours) {
}
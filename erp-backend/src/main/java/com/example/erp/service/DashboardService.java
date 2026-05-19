package com.example.erp.service;

import com.example.erp.dto.DashboardStatsResponse;
import com.example.erp.entity.AttendanceRecord;
import com.example.erp.repository.AttendanceRecordRepository;
import com.example.erp.repository.AuditLogRepository;
import com.example.erp.repository.EmployeeRepository;
import com.example.erp.repository.HrApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final HrApplicationRepository applicationRepository;
    private final AuditLogRepository auditLogRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;

    public DashboardStatsResponse getDashboardStats() {
        long totalEmployees = employeeRepository.count();

        long totalWorkedMinutes = attendanceRecordRepository.findAll()
                .stream()
                .mapToLong(record -> record.getWorkedMinutes() == null ? 0 : record.getWorkedMinutes())
                .sum();

        return new DashboardStatsResponse(
                totalEmployees,
                employeeRepository.countByRoleIgnoreCase("ADMIN"),
                employeeRepository.countByRoleIgnoreCase("MANAGER"),
                employeeRepository.countByRoleIgnoreCase("EMPLOYEE"),
                employeeRepository.countBySignedInTrue(),
                applicationRepository.countByStatusIgnoreCase("Pending"),
                applicationRepository.countByStatusIgnoreCase("Approved"),
                applicationRepository.countByStatusIgnoreCase("Rejected"),
                applicationRepository.countByPdfGeneratedTrue(),
                auditLogRepository.count(),
                attendanceRecordRepository.countByAttendanceDate(LocalDate.now()),
                attendanceRecordRepository.countByStatusIgnoreCase("SIGNED_IN"),
                attendanceRecordRepository.count(),
                totalWorkedMinutes,
                formatWorkedHours(totalWorkedMinutes));
    }

    private String formatWorkedHours(long workedMinutes) {
        long hours = workedMinutes / 60;
        long minutes = workedMinutes % 60;

        return hours + "h " + minutes + "m";
    }
}
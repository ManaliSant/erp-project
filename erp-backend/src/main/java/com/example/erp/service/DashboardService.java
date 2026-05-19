package com.example.erp.service;

import com.example.erp.dto.DashboardStatsResponse;
import com.example.erp.repository.AuditLogRepository;
import com.example.erp.repository.EmployeeRepository;
import com.example.erp.repository.HrApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final HrApplicationRepository applicationRepository;
    private final AuditLogRepository auditLogRepository;

    public DashboardStatsResponse getDashboardStats() {
        long totalEmployees = employeeRepository.count();

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
                auditLogRepository.count());
    }
}
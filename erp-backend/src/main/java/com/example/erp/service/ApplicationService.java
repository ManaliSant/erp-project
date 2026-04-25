package com.example.erp.service;

import com.example.erp.dto.ApplicationRequest;
import com.example.erp.dto.ReviewRequest;
import com.example.erp.entity.Employee;
import com.example.erp.entity.HrApplication;
import com.example.erp.repository.EmployeeRepository;
import com.example.erp.repository.HrApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final HrApplicationRepository applicationRepository;
    private final EmployeeRepository employeeRepository;

    public List<HrApplication> getAllApplications() {
        return applicationRepository.findAll();
    }

    public HrApplication createApplication(ApplicationRequest request) {
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        String managerStatus;
        String adminStatus;
        String status;

        if ("ADMIN".equalsIgnoreCase(employee.getRole())) {
            managerStatus = "Not Required";
            adminStatus = "Approved";
            status = "Approved";
        } else if ("MANAGER".equalsIgnoreCase(employee.getRole())) {
            managerStatus = "Not Required";
            adminStatus = "Pending";
            status = "Pending";
        } else {
            managerStatus = "Pending";
            adminStatus = "Pending";
            status = "Pending";
        }

        HrApplication application = HrApplication.builder()
                .id("APP-" + System.currentTimeMillis())
                .employeeId(employee.getId())
                .employeeName(employee.getName())
                .type(request.type())
                .title(request.title())
                .description(request.description())
                .dateRange(request.dateRange())
                .days(request.days())
                .status(status)
                .managerStatus(managerStatus)
                .adminStatus(adminStatus)
                .reviewedBy("")
                .reviewComment("")
                .managerReviewedBy("")
                .adminReviewedBy("")
                .createdAt(LocalDateTime.now().withNano(0).toString().replace("T", " "))
                .build();

        return applicationRepository.save(application);
    }

    public HrApplication managerApproveApplication(String id, ReviewRequest request) {
        HrApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if ("Rejected".equalsIgnoreCase(application.getStatus())) {
            throw new RuntimeException("Rejected application cannot be approved");
        }

        if ("Not Required".equalsIgnoreCase(application.getManagerStatus())) {
            return application;
        }

        if ("Approved".equalsIgnoreCase(application.getManagerStatus())) {
            return application;
        }

        application.setManagerStatus("Approved");
        application.setManagerReviewedBy(request.reviewedBy());
        application.setStatus("Manager Approved");

        return applicationRepository.save(application);
    }

    public HrApplication adminApproveApplication(String id, ReviewRequest request) {
        HrApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if ("Rejected".equalsIgnoreCase(application.getStatus())) {
            throw new RuntimeException("Rejected application cannot be approved");
        }

        if ("Approved".equalsIgnoreCase(application.getAdminStatus())) {
            return application;
        }

        Employee employee = employeeRepository.findById(application.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if ("EMPLOYEE".equalsIgnoreCase(employee.getRole())
                && !"Approved".equalsIgnoreCase(application.getManagerStatus())) {
            throw new RuntimeException("Manager approval is required before admin approval");
        }

        application.setAdminStatus("Approved");
        application.setAdminReviewedBy(request.reviewedBy());
        application.setReviewedBy(request.reviewedBy());
        application.setReviewComment(request.reviewComment());
        application.setStatus("Approved");

        if ("Leave".equalsIgnoreCase(application.getType()) && application.getDays() != null) {
            int currentLeaves = employee.getLeavesRemaining() == null ? 0 : employee.getLeavesRemaining();
            employee.setLeavesRemaining(Math.max(0, currentLeaves - application.getDays()));
            employeeRepository.save(employee);
        }

        return applicationRepository.save(application);
    }

    public HrApplication rejectApplication(String id, ReviewRequest request) {
        HrApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if ("Approved".equalsIgnoreCase(application.getStatus())) {
            throw new RuntimeException("Approved application cannot be rejected");
        }

        application.setStatus("Rejected");
        application.setManagerStatus(
                "Pending".equalsIgnoreCase(application.getManagerStatus())
                        ? "Rejected"
                        : application.getManagerStatus());
        application.setAdminStatus("Rejected");
        application.setReviewedBy(request.reviewedBy());
        application.setReviewComment(request.reviewComment());

        return applicationRepository.save(application);
    }
}
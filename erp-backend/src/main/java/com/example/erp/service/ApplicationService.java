package com.example.erp.service;

import com.example.erp.dto.ApplicationRequest;
import com.example.erp.dto.ReviewRequest;
import com.example.erp.entity.ApplicationStatus;
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
        HrApplication application = HrApplication.builder()
                .id("APP-" + System.currentTimeMillis())
                .employeeId(request.employeeId())
                .employeeName(request.employeeName())
                .type(request.type())
                .title(request.title())
                .description(request.description())
                .dateRange(request.dateRange())
                .days(request.days())
                .status(ApplicationStatus.Pending)
                .reviewedBy("")
                .reviewComment("")
                .createdAt(LocalDateTime.now().withNano(0).toString().replace("T", " "))
                .build();

        return applicationRepository.save(application);
    }

    public HrApplication approveApplication(String id, ReviewRequest request) {
        HrApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(ApplicationStatus.Approved);
        application.setReviewedBy(request.reviewedBy());
        application.setReviewComment(request.reviewComment());

        if ("Leave".equalsIgnoreCase(application.getType()) && application.getDays() != null) {
            Employee employee = employeeRepository.findById(application.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found"));

            int currentLeaves = employee.getLeavesRemaining() == null ? 0 : employee.getLeavesRemaining();
            employee.setLeavesRemaining(Math.max(0, currentLeaves - application.getDays()));
            employeeRepository.save(employee);
        }

        return applicationRepository.save(application);
    }

    public HrApplication rejectApplication(String id, ReviewRequest request) {
        HrApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(ApplicationStatus.Rejected);
        application.setReviewedBy(request.reviewedBy());
        application.setReviewComment(request.reviewComment());

        return applicationRepository.save(application);
    }
}
package com.example.erp.service;

import com.example.erp.dto.ApplicationRequest;
import com.example.erp.dto.ReviewRequest;
import com.example.erp.entity.Employee;
import com.example.erp.entity.HrApplication;
import com.example.erp.repository.EmployeeRepository;
import com.example.erp.repository.HrApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final HrApplicationRepository applicationRepository;
    private final EmployeeRepository employeeRepository;

    private Employee getLoggedInEmployee(Authentication authentication) {
        String email = authentication.getName();

        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged-in employee not found"));
    }

    public List<HrApplication> getApplicationsForCurrentUser(Authentication authentication) {
        Employee currentUser = getLoggedInEmployee(authentication);

        if ("ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return applicationRepository.findAll();
        }

        if ("MANAGER".equalsIgnoreCase(currentUser.getRole())) {
            List<Employee> teamMembers = employeeRepository.findByManager(currentUser.getName());

            Set<Long> teamIds = new HashSet<>();
            for (Employee employee : teamMembers) {
                teamIds.add(employee.getId());
            }

            return applicationRepository.findAll()
                    .stream()
                    .filter(app -> teamIds.contains(app.getEmployeeId()))
                    .toList();
        }

        return applicationRepository.findByEmployeeId(currentUser.getId());
    }

    public HrApplication createApplication(ApplicationRequest request, Authentication authentication) {
        Employee currentUser = getLoggedInEmployee(authentication);

        if (!currentUser.getId().equals(request.employeeId())) {
            throw new RuntimeException("Employees can only create applications for themselves");
        }

        String managerStatus;
        String adminStatus;
        String status;

        if ("ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            managerStatus = "Not Required";
            adminStatus = "Approved";
            status = "Approved";
        } else if ("MANAGER".equalsIgnoreCase(currentUser.getRole())) {
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
                .employeeId(currentUser.getId())
                .employeeName(currentUser.getName())
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

    public HrApplication managerApproveApplication(String id, ReviewRequest request, Authentication authentication) {
        Employee manager = getLoggedInEmployee(authentication);

        HrApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Employee applicationOwner = employeeRepository.findById(application.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (!manager.getName().equalsIgnoreCase(applicationOwner.getManager())) {
            throw new RuntimeException("Manager can only approve own team applications");
        }

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

    public HrApplication rejectApplication(String id, ReviewRequest request, Authentication authentication) {
        Employee currentUser = getLoggedInEmployee(authentication);

        HrApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if ("Approved".equalsIgnoreCase(application.getStatus())) {
            throw new RuntimeException("Approved application cannot be rejected");
        }

        if ("MANAGER".equalsIgnoreCase(currentUser.getRole())) {
            Employee applicationOwner = employeeRepository.findById(application.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found"));

            if (!currentUser.getName().equalsIgnoreCase(applicationOwner.getManager())) {
                throw new RuntimeException("Manager can only reject own team applications");
            }
        }

        application.setStatus("Rejected");
        application.setReviewComment(request.reviewComment());
        application.setReviewedBy(request.reviewedBy());

        if ("Pending".equalsIgnoreCase(application.getManagerStatus())) {
            application.setManagerStatus("Rejected");
        }

        application.setAdminStatus("Rejected");

        return applicationRepository.save(application);
    }
}
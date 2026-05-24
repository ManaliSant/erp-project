package com.example.erp.service;

import com.example.erp.dto.ApplicationRequest;
import com.example.erp.dto.ReviewRequest;
import com.example.erp.entity.Employee;
import com.example.erp.entity.HrApplication;
import com.example.erp.exception.BadRequestException;
import com.example.erp.repository.EmployeeRepository;
import com.example.erp.repository.HrApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final HrApplicationRepository applicationRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditService auditService;
    private final LeaveApprovalPdfService leaveApprovalPdfService;
    private final ReferenceLetterPdfService referenceLetterPdfService;
    private final NotificationService notificationService;

    private Employee getLoggedInEmployee(Authentication authentication) {
        String email = authentication.getName();

        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Logged-in employee not found"));
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

    @Transactional
    public HrApplication createApplication(ApplicationRequest request, Authentication authentication) {
        Employee currentUser = getLoggedInEmployee(authentication);

        if (!currentUser.getId().equals(request.employeeId())) {
            throw new BadRequestException("Employees can only create applications for themselves");
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
                .referenceText("")
                .managerReviewedBy("")
                .adminReviewedBy("")
                .createdAt(LocalDateTime.now().withNano(0).toString().replace("T", " "))
                .pdfGenerated(false)
                .pdfPath("")
                .pdfGeneratedAt("")
                .build();

        HrApplication savedApplication = applicationRepository.save(application);

        if ("EMPLOYEE".equalsIgnoreCase(currentUser.getRole())
                && currentUser.getManager() != null
                && !currentUser.getManager().isBlank()) {

            employeeRepository.findByNameIgnoreCase(currentUser.getManager())
                    .ifPresent(manager -> notificationService.createNotification(
                            manager,
                            "New Application Submitted",
                            currentUser.getName() + " submitted a "
                                    + savedApplication.getType() + " request.",
                            "APPLICATION",
                            savedApplication.getId()));
        }

        auditService.log(
                currentUser.getEmail(),
                "CREATE_APPLICATION",
                "APPLICATION_ID:" + savedApplication.getId(),
                "Created " + savedApplication.getType() + " application");

        return savedApplication;
    }

    @Transactional
    public HrApplication managerApproveApplication(String id, ReviewRequest request, Authentication authentication) {
        Employee manager = getLoggedInEmployee(authentication);

        HrApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Application not found"));

        Employee applicationOwner = employeeRepository.findById(application.getEmployeeId())
                .orElseThrow(() -> new BadRequestException("Employee not found"));

        if (!manager.getName().equalsIgnoreCase(applicationOwner.getManager())) {
            throw new BadRequestException("Manager can only approve own team applications");
        }

        if ("Rejected".equalsIgnoreCase(application.getStatus())) {
            throw new BadRequestException("Rejected application cannot be approved");
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

        HrApplication savedApplication = applicationRepository.save(application);

        notificationService.createNotification(
                applicationOwner,
                "Application Approved By Manager",
                "Your " + application.getType()
                        + " request was approved by manager "
                        + manager.getName() + ".",
                "APPLICATION",
                application.getId());

        auditService.log(
                manager.getEmail(),
                "MANAGER_APPROVE_APPLICATION",
                "APPLICATION_ID:" + savedApplication.getId(),
                "Manager approved application for employee ID " + application.getEmployeeId());

        return savedApplication;
    }

    @Transactional
    public HrApplication adminApproveApplication(String id, ReviewRequest request, Authentication authentication) {
        Employee admin = getLoggedInEmployee(authentication);

        HrApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Application not found"));

        if ("Rejected".equalsIgnoreCase(application.getStatus())) {
            throw new BadRequestException("Rejected application cannot be approved");
        }

        if ("Approved".equalsIgnoreCase(application.getAdminStatus())) {
            return application;
        }

        Employee employee = employeeRepository.findById(application.getEmployeeId())
                .orElseThrow(() -> new BadRequestException("Employee not found"));

        if ("EMPLOYEE".equalsIgnoreCase(employee.getRole())
                && !"Approved".equalsIgnoreCase(application.getManagerStatus())) {
            throw new BadRequestException("Manager approval is required before admin approval");
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

            String pdfPath = leaveApprovalPdfService.generateLeaveApprovalPdf(application, employee);
            application.setPdfGenerated(true);
            application.setPdfPath(pdfPath);
            application.setPdfGeneratedAt(LocalDateTime.now().withNano(0).toString().replace("T", " "));

            notificationService.createNotification(
                    employee,
                    "Leave Approved",
                    "Your leave request has been approved and approval PDF generated.",
                    "APPLICATION",
                    application.getId());
        }

        if ("Reference Letter".equalsIgnoreCase(application.getType())) {
            String referenceText = request.referenceText();

            if (referenceText == null || referenceText.isBlank()) {
                throw new BadRequestException("Reference letter content is required");
            }

            application.setReferenceText(referenceText);

            String pdfPath = referenceLetterPdfService.generateReferenceLetterPdf(application, employee);
            application.setPdfGenerated(true);
            application.setPdfPath(pdfPath);
            application.setPdfGeneratedAt(LocalDateTime.now().withNano(0).toString().replace("T", " "));

            notificationService.createNotification(
                    employee,
                    "Reference Letter Ready",
                    "Your reference letter has been approved and PDF generated.",
                    "APPLICATION",
                    application.getId());
        }

        HrApplication savedApplication = applicationRepository.save(application);

        notificationService.createNotification(
                employee,
                "Application Approved",
                "Your " + application.getType() + " request has been fully approved.",
                "APPLICATION",
                application.getId());

        auditService.log(
                admin.getEmail(),
                "ADMIN_APPROVE_APPLICATION",
                "APPLICATION_ID:" + savedApplication.getId(),
                "Admin final approved application");

        if (Boolean.TRUE.equals(savedApplication.getPdfGenerated())) {
            String action = "Reference Letter".equalsIgnoreCase(savedApplication.getType())
                    ? "GENERATE_REFERENCE_LETTER_PDF"
                    : "GENERATE_LEAVE_APPROVAL_PDF";

            auditService.log(
                    admin.getEmail(),
                    action,
                    "APPLICATION_ID:" + savedApplication.getId(),
                    "Generated PDF for " + savedApplication.getType());
        }

        return savedApplication;
    }

    @Transactional
    public HrApplication rejectApplication(String id, ReviewRequest request, Authentication authentication) {
        Employee currentUser = getLoggedInEmployee(authentication);

        HrApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Application not found"));

        if ("Approved".equalsIgnoreCase(application.getStatus())) {
            throw new BadRequestException("Approved application cannot be rejected");
        }

        Employee applicationOwner = employeeRepository.findById(application.getEmployeeId())
                .orElseThrow(() -> new BadRequestException("Employee not found"));

        if ("MANAGER".equalsIgnoreCase(currentUser.getRole())) {
            if (!currentUser.getName().equalsIgnoreCase(applicationOwner.getManager())) {
                throw new BadRequestException("Manager can only reject own team applications");
            }
        }

        application.setStatus("Rejected");
        application.setReviewComment(request.reviewComment());
        application.setReviewedBy(request.reviewedBy());

        if ("Pending".equalsIgnoreCase(application.getManagerStatus())) {
            application.setManagerStatus("Rejected");
        }

        application.setAdminStatus("Rejected");

        HrApplication savedApplication = applicationRepository.save(application);

        notificationService.createNotification(
                applicationOwner,
                "Application Rejected",
                "Your " + application.getType()
                        + " request was rejected by "
                        + currentUser.getName() + ".",
                "APPLICATION",
                application.getId());

        auditService.log(
                currentUser.getEmail(),
                "REJECT_APPLICATION",
                "APPLICATION_ID:" + savedApplication.getId(),
                "Application rejected");

        return savedApplication;
    }
}
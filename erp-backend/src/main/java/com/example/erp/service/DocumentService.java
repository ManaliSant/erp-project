package com.example.erp.service;

import com.example.erp.entity.Employee;
import com.example.erp.entity.HrApplication;
import com.example.erp.exception.BadRequestException;
import com.example.erp.repository.EmployeeRepository;
import com.example.erp.repository.HrApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final HrApplicationRepository applicationRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditService auditService;

    private Employee getLoggedInEmployee(Authentication authentication) {
        return employeeRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new BadRequestException("Logged-in employee not found"));
    }

    public Resource downloadLeaveApprovalPdf(String applicationId, Authentication authentication) {
        Employee currentUser = getLoggedInEmployee(authentication);

        HrApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new BadRequestException("Application not found"));

        Employee applicationOwner = employeeRepository.findById(application.getEmployeeId())
                .orElseThrow(() -> new BadRequestException("Employee not found"));

        validateAccess(currentUser, applicationOwner, application);

        if (!Boolean.TRUE.equals(application.getPdfGenerated()) || application.getPdfPath() == null
                || application.getPdfPath().isBlank()) {
            throw new BadRequestException("PDF has not been generated for this application");
        }

        File file = new File(application.getPdfPath());

        if (!file.exists()) {
            throw new BadRequestException("PDF file not found on server");
        }

        auditService.log(
                currentUser.getEmail(),
                "DOWNLOAD_LEAVE_APPROVAL_PDF",
                "APPLICATION_ID:" + application.getId(),
                "Downloaded leave approval PDF");

        return new FileSystemResource(file);
    }

    private void validateAccess(Employee currentUser, Employee applicationOwner, HrApplication application) {
        if (!"Approved".equalsIgnoreCase(application.getStatus())) {
            throw new BadRequestException("PDF is available only for approved applications");
        }

        if (!"Leave".equalsIgnoreCase(application.getType())) {
            throw new BadRequestException("This PDF is only available for leave applications");
        }

        if ("ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return;
        }

        if ("MANAGER".equalsIgnoreCase(currentUser.getRole())) {
            if (currentUser.getName().equalsIgnoreCase(applicationOwner.getManager())) {
                return;
            }

            throw new BadRequestException("Manager can download PDFs only for own team applications");
        }

        if (currentUser.getId().equals(applicationOwner.getId())) {
            return;
        }

        throw new BadRequestException("You can download only your own leave approval PDF");
    }
}
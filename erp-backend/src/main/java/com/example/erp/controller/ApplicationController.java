package com.example.erp.controller;

import com.example.erp.dto.ApplicationRequest;
import com.example.erp.dto.ReviewRequest;
import com.example.erp.entity.HrApplication;
import com.example.erp.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class ApplicationController {

    private final ApplicationService applicationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public List<HrApplication> getApplications(Authentication authentication) {
        return applicationService.getApplicationsForCurrentUser(authentication);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public HrApplication createApplication(
            @RequestBody ApplicationRequest request,
            Authentication authentication) {
        return applicationService.createApplication(request, authentication);
    }

    @PatchMapping("/{id}/manager-approve")
    @PreAuthorize("hasRole('MANAGER')")
    public HrApplication managerApproveApplication(
            @PathVariable String id,
            @RequestBody ReviewRequest request,
            Authentication authentication) {
        return applicationService.managerApproveApplication(id, request, authentication);
    }

    @PatchMapping("/{id}/admin-approve")
    @PreAuthorize("hasRole('ADMIN')")
    public HrApplication adminApproveApplication(
            @PathVariable String id,
            @RequestBody ReviewRequest request) {
        return applicationService.adminApproveApplication(id, request);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public HrApplication rejectApplication(
            @PathVariable String id,
            @RequestBody ReviewRequest request,
            Authentication authentication) {
        return applicationService.rejectApplication(id, request, authentication);
    }
}
package com.example.erp.controller;

import com.example.erp.dto.ApplicationRequest;
import com.example.erp.dto.ReviewRequest;
import com.example.erp.entity.HrApplication;
import com.example.erp.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class ApplicationController {

    private final ApplicationService applicationService;

    @GetMapping
    public List<HrApplication> getApplications() {
        return applicationService.getAllApplications();
    }

    @PostMapping
    public HrApplication createApplication(@RequestBody ApplicationRequest request) {
        return applicationService.createApplication(request);
    }

    @PatchMapping("/{id}/manager-approve")
    public HrApplication managerApproveApplication(
            @PathVariable String id,
            @RequestBody ReviewRequest request) {
        return applicationService.managerApproveApplication(id, request);
    }

    @PatchMapping("/{id}/admin-approve")
    public HrApplication adminApproveApplication(
            @PathVariable String id,
            @RequestBody ReviewRequest request) {
        return applicationService.adminApproveApplication(id, request);
    }

    @PatchMapping("/{id}/reject")
    public HrApplication rejectApplication(
            @PathVariable String id,
            @RequestBody ReviewRequest request) {
        return applicationService.rejectApplication(id, request);
    }
}
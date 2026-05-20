package com.example.erp.controller;

import com.example.erp.dto.AnnouncementRequest;
import com.example.erp.dto.AnnouncementResponse;
import com.example.erp.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public List<AnnouncementResponse> getAll(Authentication authentication) {
        return announcementService.getAll(authentication);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public AnnouncementResponse create(
            @RequestBody AnnouncementRequest request,
            Authentication authentication) {
        return announcementService.create(request, authentication);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        announcementService.delete(id, authentication);
    }

    @PostMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAsRead(@PathVariable Long id, Authentication authentication) {
        announcementService.markAsRead(id, authentication);
    }
}

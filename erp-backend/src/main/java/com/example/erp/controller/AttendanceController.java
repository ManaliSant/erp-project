package com.example.erp.controller;

import com.example.erp.entity.AttendanceRecord;
import com.example.erp.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/sign-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public AttendanceRecord signIn(Authentication authentication) {
        return attendanceService.signIn(authentication);
    }

    @PostMapping("/sign-out")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public AttendanceRecord signOut(Authentication authentication) {
        return attendanceService.signOut(authentication);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public List<AttendanceRecord> myAttendance(Authentication authentication) {
        return attendanceService.getMyAttendance(authentication);
    }

    @GetMapping("/team")
    @PreAuthorize("hasRole('MANAGER')")
    public List<AttendanceRecord> teamAttendance(Authentication authentication) {
        return attendanceService.getTeamAttendance(authentication);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AttendanceRecord> allAttendance() {
        return attendanceService.getAllAttendance();
    }
}
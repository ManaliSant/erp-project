package com.example.erp.controller;

import com.example.erp.entity.AttendanceRecord;
import com.example.erp.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    public List<AttendanceRecord> getAttendance() {
        return attendanceService.getAllAttendance();
    }

    @PostMapping("/sign-in")
    public AttendanceRecord signIn(@RequestBody Map<String, Object> payload) {
        return attendanceService.signIn(payload);
    }

    @PostMapping("/sign-out")
    public AttendanceRecord signOut(@RequestBody Map<String, Object> payload) {
        return attendanceService.signOut(payload);
    }
}
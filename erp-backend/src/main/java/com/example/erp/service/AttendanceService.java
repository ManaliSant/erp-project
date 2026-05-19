package com.example.erp.service;

import com.example.erp.entity.AttendanceRecord;
import com.example.erp.entity.Employee;
import com.example.erp.exception.BadRequestException;
import com.example.erp.repository.AttendanceRecordRepository;
import com.example.erp.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditService auditService;

    private Employee getLoggedInEmployee(Authentication authentication) {
        String email = authentication.getName();

        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Employee not found"));
    }

    @Transactional
    public AttendanceRecord signIn(Authentication authentication) {
        Employee employee = getLoggedInEmployee(authentication);

        if (!"Active".equalsIgnoreCase(employee.getStatus())) {
            throw new BadRequestException("Inactive employees cannot sign in");
        }

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now().withNano(0);

        AttendanceRecord record = attendanceRecordRepository
                .findByEmployeeIdAndAttendanceDate(employee.getId(), today)
                .orElse(null);

        if (record != null && "SIGNED_IN".equalsIgnoreCase(record.getStatus())) {
            throw new BadRequestException("Already signed in today");
        }

        if (record != null && "SIGNED_OUT".equalsIgnoreCase(record.getStatus())) {
            throw new BadRequestException("Attendance already completed for today");
        }

        if (record == null) {
            record = AttendanceRecord.builder()
                    .id("ATT-" + UUID.randomUUID())
                    .employeeId(employee.getId())
                    .employeeName(employee.getName())
                    .employeeEmail(employee.getEmail())
                    .role(employee.getRole())
                    .department(employee.getDepartment())
                    .manager(employee.getManager())
                    .attendanceDate(today)
                    .signInTime(now)
                    .signOutTime(null)
                    .workedMinutes(0L)
                    .workedHours("0h 0m")
                    .status("SIGNED_IN")
                    .build();
        } else {
            record.setSignInTime(now);
            record.setSignOutTime(null);
            record.setWorkedMinutes(0L);
            record.setWorkedHours("0h 0m");
            record.setStatus("SIGNED_IN");
        }

        employee.setSignedIn(true);
        employee.setLastSignIn(now.toString());
        employeeRepository.save(employee);

        AttendanceRecord savedRecord = attendanceRecordRepository.save(record);

        auditService.log(
                employee.getEmail(),
                "SIGN_IN",
                "EMPLOYEE_ID:" + employee.getId(),
                "Employee signed in");

        return savedRecord;
    }

    @Transactional
    public AttendanceRecord signOut(Authentication authentication) {
        Employee employee = getLoggedInEmployee(authentication);

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now().withNano(0);

        AttendanceRecord record = attendanceRecordRepository
                .findByEmployeeIdAndAttendanceDate(employee.getId(), today)
                .orElseThrow(() -> new BadRequestException("Sign in first"));

        if ("SIGNED_OUT".equalsIgnoreCase(record.getStatus())) {
            throw new BadRequestException("Already signed out");
        }

        long workedMinutes = Duration.between(record.getSignInTime(), now).toMinutes();

        if (workedMinutes < 0) {
            throw new BadRequestException("Invalid attendance time calculation");
        }

        record.setSignOutTime(now);
        record.setWorkedMinutes(workedMinutes);
        record.setWorkedHours(formatWorkedHours(workedMinutes));
        record.setStatus("SIGNED_OUT");

        employee.setSignedIn(false);
        employee.setLastSignOut(now.toString());
        employeeRepository.save(employee);

        AttendanceRecord savedRecord = attendanceRecordRepository.save(record);

        auditService.log(
                employee.getEmail(),
                "SIGN_OUT",
                "EMPLOYEE_ID:" + employee.getId(),
                "Employee signed out after " + savedRecord.getWorkedHours());

        return savedRecord;
    }

    public List<AttendanceRecord> getMyAttendance(Authentication authentication) {
        Employee employee = getLoggedInEmployee(authentication);
        return attendanceRecordRepository.findByEmployeeIdOrderByAttendanceDateDesc(employee.getId());
    }

    public List<AttendanceRecord> getTeamAttendance(Authentication authentication) {
        Employee manager = getLoggedInEmployee(authentication);

        if (!"MANAGER".equalsIgnoreCase(manager.getRole())) {
            throw new BadRequestException("Only managers can view team attendance");
        }

        return attendanceRecordRepository.findByManagerOrderByAttendanceDateDesc(manager.getName());
    }

    public List<AttendanceRecord> getAllAttendance() {
        return attendanceRecordRepository.findAll();
    }

    public List<AttendanceRecord> getAttendanceByDate(LocalDate date) {
        return attendanceRecordRepository.findByAttendanceDateOrderByEmployeeNameAsc(date);
    }

    public List<AttendanceRecord> getAttendanceBetweenDates(LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new BadRequestException("End date cannot be before start date");
        }

        return attendanceRecordRepository.findByAttendanceDateBetweenOrderByAttendanceDateDesc(startDate, endDate);
    }

    private String formatWorkedHours(long workedMinutes) {
        long hours = workedMinutes / 60;
        long minutes = workedMinutes % 60;

        return hours + "h " + minutes + "m";
    }
}
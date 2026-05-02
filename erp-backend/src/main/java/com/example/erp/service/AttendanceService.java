package com.example.erp.service;

import com.example.erp.entity.AttendanceRecord;
import com.example.erp.entity.Employee;
import com.example.erp.exception.BadRequestException;
import com.example.erp.repository.AttendanceRecordRepository;
import com.example.erp.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

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

    public AttendanceRecord signIn(Authentication authentication) {
        Employee employee = getLoggedInEmployee(authentication);

        String today = LocalDate.now().toString();
        String now = LocalTime.now().withNano(0).format(DateTimeFormatter.ISO_LOCAL_TIME);

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
                    .id("ATT-" + System.currentTimeMillis())
                    .employeeId(employee.getId())
                    .employeeName(employee.getName())
                    .employeeEmail(employee.getEmail())
                    .role(employee.getRole())
                    .department(employee.getDepartment())
                    .manager(employee.getManager())
                    .attendanceDate(today)
                    .signInTime(now)
                    .signOutTime("")
                    .status("SIGNED_IN")
                    .build();
        } else {
            record.setSignInTime(now);
            record.setSignOutTime("");
            record.setStatus("SIGNED_IN");
        }

        employee.setSignedIn(true);
        employee.setLastSignIn(now);
        employeeRepository.save(employee);

        AttendanceRecord savedRecord = attendanceRecordRepository.save(record);

        auditService.log(
                employee.getEmail(),
                "SIGN_IN",
                "EMPLOYEE_ID:" + employee.getId(),
                "Employee signed in");

        return savedRecord;
    }

    public AttendanceRecord signOut(Authentication authentication) {
        Employee employee = getLoggedInEmployee(authentication);

        String today = LocalDate.now().toString();
        String now = LocalTime.now().withNano(0).format(DateTimeFormatter.ISO_LOCAL_TIME);

        AttendanceRecord record = attendanceRecordRepository
                .findByEmployeeIdAndAttendanceDate(employee.getId(), today)
                .orElseThrow(() -> new BadRequestException("Sign in first"));

        if ("SIGNED_OUT".equalsIgnoreCase(record.getStatus())) {
            throw new BadRequestException("Already signed out");
        }

        record.setSignOutTime(now);
        record.setStatus("SIGNED_OUT");

        employee.setSignedIn(false);
        employee.setLastSignOut(now);
        employeeRepository.save(employee);

        AttendanceRecord savedRecord = attendanceRecordRepository.save(record);

        auditService.log(
                employee.getEmail(),
                "SIGN_OUT",
                "EMPLOYEE_ID:" + employee.getId(),
                "Employee signed out");

        return savedRecord;
    }

    public List<AttendanceRecord> getMyAttendance(Authentication authentication) {
        Employee employee = getLoggedInEmployee(authentication);
        return attendanceRecordRepository.findByEmployeeId(employee.getId());
    }

    public List<AttendanceRecord> getTeamAttendance(Authentication authentication) {
        Employee manager = getLoggedInEmployee(authentication);

        if (!"MANAGER".equalsIgnoreCase(manager.getRole())) {
            throw new BadRequestException("Only managers can view team attendance");
        }

        return attendanceRecordRepository.findByManager(manager.getName());
    }

    public List<AttendanceRecord> getAllAttendance() {
        return attendanceRecordRepository.findAll();
    }
}
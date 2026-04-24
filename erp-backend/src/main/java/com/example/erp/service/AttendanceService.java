package com.example.erp.service;

import com.example.erp.entity.AttendanceRecord;
import com.example.erp.entity.Employee;
import com.example.erp.repository.AttendanceRecordRepository;
import com.example.erp.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final EmployeeRepository employeeRepository;

    public List<AttendanceRecord> getAllAttendance() {
        return attendanceRecordRepository.findAll();
    }

    public AttendanceRecord signIn(Map<String, Object> payload) {
        Long employeeId = Long.valueOf(payload.get("employeeId").toString());

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        AttendanceRecord record = AttendanceRecord.builder()
                .employeeId(employee.getId())
                .employeeName(employee.getName())
                .date(LocalDate.now().toString())
                .signInTime(LocalTime.now().withNano(0).toString())
                .signOutTime("")
                .build();

        employee.setSignedIn(true);
        employee.setLastSignIn(LocalTime.now().withNano(0).toString());
        employeeRepository.save(employee);

        return attendanceRecordRepository.save(record);
    }

    public AttendanceRecord signOut(Map<String, Object> payload) {
        Long employeeId = Long.valueOf(payload.get("employeeId").toString());

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        AttendanceRecord latest = attendanceRecordRepository.findAll().stream()
                .filter(r -> r.getEmployeeId().equals(employeeId))
                .reduce((first, second) -> second)
                .orElseThrow(() -> new RuntimeException("No sign-in record found"));

        latest.setSignOutTime(LocalTime.now().withNano(0).toString());

        employee.setSignedIn(false);
        employee.setLastSignOut(LocalTime.now().withNano(0).toString());
        employeeRepository.save(employee);

        return attendanceRecordRepository.save(latest);
    }
}
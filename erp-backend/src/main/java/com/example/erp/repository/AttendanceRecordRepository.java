package com.example.erp.repository;

import com.example.erp.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, String> {

    List<AttendanceRecord> findByEmployeeId(Long employeeId);

    List<AttendanceRecord> findByManager(String manager);

    Optional<AttendanceRecord> findByEmployeeIdAndAttendanceDate(Long employeeId, String attendanceDate);
}
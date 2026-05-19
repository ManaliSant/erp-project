package com.example.erp.repository;

import com.example.erp.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, String> {

    List<AttendanceRecord> findByEmployeeIdOrderByAttendanceDateDesc(Long employeeId);

    List<AttendanceRecord> findByManagerOrderByAttendanceDateDesc(String manager);

    List<AttendanceRecord> findByAttendanceDateOrderByEmployeeNameAsc(LocalDate attendanceDate);

    List<AttendanceRecord> findByAttendanceDateBetweenOrderByAttendanceDateDesc(
            LocalDate startDate,
            LocalDate endDate);

    Optional<AttendanceRecord> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate attendanceDate);
}
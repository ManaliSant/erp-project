package com.example.erp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendance_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord {

    @Id
    private String id;

    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private String role;
    private String department;
    private String manager;

    private LocalDate attendanceDate;
    private LocalTime signInTime;
    private LocalTime signOutTime;

    private Long workedMinutes;
    private String workedHours;

    private String status; // SIGNED_IN, SIGNED_OUT
}
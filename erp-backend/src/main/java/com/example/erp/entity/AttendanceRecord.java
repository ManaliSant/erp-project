package com.example.erp.entity;

import jakarta.persistence.*;
import lombok.*;

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

    private String attendanceDate;
    private String signInTime;
    private String signOutTime;

    private String status; // SIGNED_IN, SIGNED_OUT
}
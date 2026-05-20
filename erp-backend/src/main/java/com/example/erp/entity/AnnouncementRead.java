package com.example.erp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "announcement_reads",
        uniqueConstraints = @UniqueConstraint(columnNames = {"announcement_id", "employee_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementRead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "announcement_id", nullable = false)
    private Long announcementId;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    private LocalDateTime readAt;
}

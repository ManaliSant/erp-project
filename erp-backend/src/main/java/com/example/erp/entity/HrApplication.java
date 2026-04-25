package com.example.erp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HrApplication {

    @Id
    private String id;

    private Long employeeId;
    private String employeeName;

    private String type;
    private String title;

    @Column(length = 2000)
    private String description;

    private String dateRange;
    private Integer days;

    // Overall status:
    // Pending, Manager Approved, Approved, Rejected
    private String status;

    // Stage statuses
    private String managerStatus; // Pending, Approved, Rejected, Not Required
    private String adminStatus; // Pending, Approved, Rejected

    private String reviewedBy;

    @Column(length = 2000)
    private String reviewComment;

    private String managerReviewedBy;
    private String adminReviewedBy;

    private String createdAt;
}
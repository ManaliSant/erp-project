package com.example.erp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;

    private String title;

    @Column(length = 3000)
    private String message;

    private String category;

    private String actionType;

    private Boolean readFlag;

    private LocalDateTime createdAt;
}
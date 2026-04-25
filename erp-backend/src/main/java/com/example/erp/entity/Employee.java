package com.example.erp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    private Long id;

    @Column(nullable = false, unique = true)
    private String employeeCode;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // ADMIN, MANAGER, EMPLOYEE

    private String department;
    private String designation;
    private String manager;
    private String joinDate;
    private Integer leavesRemaining;
    private Boolean signedIn;
    private String lastSignIn;
    private String lastSignOut;
    private String status;
}
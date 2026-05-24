package com.example.erp.repository;

import com.example.erp.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    long countByEmployeeIdAndReadFlagFalse(Long employeeId);
}
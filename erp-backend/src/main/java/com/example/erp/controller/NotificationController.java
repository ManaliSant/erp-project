package com.example.erp.controller;

import com.example.erp.entity.Employee;
import com.example.erp.entity.Notification;
import com.example.erp.repository.EmployeeRepository;
import com.example.erp.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final EmployeeRepository employeeRepository;

    private Employee getCurrentUser(Authentication authentication) {

        return employeeRepository
                .findByEmail(authentication.getName())
                .orElseThrow();
    }

    @GetMapping
    public List<Notification> getMyNotifications(
            Authentication authentication) {

        Employee employee = getCurrentUser(authentication);

        return notificationService
                .getEmployeeNotifications(employee.getId());
    }

    @GetMapping("/unread-count")
    public long unreadCount(
            Authentication authentication) {

        Employee employee = getCurrentUser(authentication);

        return notificationService
                .getUnreadCount(employee.getId());
    }

    @PutMapping("/{id}/read")
    public void markRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }
}
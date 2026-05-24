package com.example.erp.service;

import com.example.erp.entity.Employee;
import com.example.erp.entity.Notification;
import com.example.erp.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void createNotification(
            Employee employee,
            String title,
            String message,
            String category,
            String actionType) {

        Notification notification = Notification.builder()
                .employeeId(employee.getId())
                .title(title)
                .message(message)
                .category(category)
                .actionType(actionType)
                .readFlag(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }

    public List<Notification> getEmployeeNotifications(Long employeeId) {
        return notificationRepository
                .findByEmployeeIdOrderByCreatedAtDesc(employeeId);
    }

    public long getUnreadCount(Long employeeId) {
        return notificationRepository
                .countByEmployeeIdAndReadFlagFalse(employeeId);
    }

    public void markAsRead(Long id) {

        notificationRepository.findById(id)
                .ifPresent(notification -> {
                    notification.setReadFlag(true);
                    notificationRepository.save(notification);
                });
    }
}
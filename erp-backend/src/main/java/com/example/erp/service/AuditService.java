package com.example.erp.service;

import com.example.erp.entity.AuditLog;
import com.example.erp.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(String actorEmail, String action, String target, String details) {
        AuditLog auditLog = AuditLog.builder()
                .actorEmail(actorEmail)
                .action(action)
                .target(target)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();

        auditLogRepository.save(auditLog);
    }

    public Page<AuditLog> getAuditLogs(String search, Pageable pageable) {
        if (search == null || search.isBlank()) {
            return auditLogRepository.findAll(pageable);
        }

        return auditLogRepository
                .findByActorEmailContainingIgnoreCaseOrActionContainingIgnoreCaseOrTargetContainingIgnoreCase(
                        search,
                        search,
                        search,
                        pageable);
    }
}
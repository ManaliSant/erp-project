package com.example.erp.service;

import com.example.erp.entity.AuditLog;
import com.example.erp.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

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

    public String exportAuditLogsCsv(String search) {
        List<AuditLog> logs;

        if (search == null || search.isBlank()) {
            logs = auditLogRepository.findAll();
        } else {
            logs = auditLogRepository
                    .findByActorEmailContainingIgnoreCaseOrActionContainingIgnoreCaseOrTargetContainingIgnoreCase(
                            search,
                            search,
                            search,
                            Pageable.unpaged())
                    .getContent();
        }

        StringBuilder csv = new StringBuilder();

        csv.append("ID,Actor Email,Action,Target,Details,Timestamp\n");

        for (AuditLog log : logs) {
            csv.append(safeCsv(log.getId()))
                    .append(",")
                    .append(safeCsv(log.getActorEmail()))
                    .append(",")
                    .append(safeCsv(log.getAction()))
                    .append(",")
                    .append(safeCsv(log.getTarget()))
                    .append(",")
                    .append(safeCsv(log.getDetails()))
                    .append(",")
                    .append(safeCsv(log.getTimestamp()))
                    .append("\n");
        }

        return csv.toString();
    }

    private String safeCsv(Object value) {
        if (value == null) {
            return "";
        }

        String text = value.toString().replace("\"", "\"\"");

        return "\"" + text + "\"";
    }
}
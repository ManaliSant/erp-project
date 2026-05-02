package com.example.erp.repository;

import com.example.erp.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByActorEmailContainingIgnoreCaseOrActionContainingIgnoreCaseOrTargetContainingIgnoreCase(
            String actorEmail,
            String action,
            String target,
            Pageable pageable);
}
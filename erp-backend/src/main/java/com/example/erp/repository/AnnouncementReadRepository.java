package com.example.erp.repository;

import com.example.erp.entity.AnnouncementRead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Set;
import java.util.stream.Collectors;

public interface AnnouncementReadRepository extends JpaRepository<AnnouncementRead, Long> {

    boolean existsByAnnouncementIdAndEmployeeId(Long announcementId, Long employeeId);

    java.util.List<AnnouncementRead> findByEmployeeId(Long employeeId);

    default Set<Long> readAnnouncementIdsForEmployee(Long employeeId) {
        return findByEmployeeId(employeeId)
                .stream()
                .map(AnnouncementRead::getAnnouncementId)
                .collect(Collectors.toSet());
    }
}

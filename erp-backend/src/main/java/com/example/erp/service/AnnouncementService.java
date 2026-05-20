package com.example.erp.service;

import com.example.erp.dto.AnnouncementRequest;
import com.example.erp.dto.AnnouncementResponse;
import com.example.erp.entity.Announcement;
import com.example.erp.entity.AnnouncementRead;
import com.example.erp.entity.Employee;
import com.example.erp.exception.BadRequestException;
import com.example.erp.repository.AnnouncementReadRepository;
import com.example.erp.repository.AnnouncementRepository;
import com.example.erp.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final AnnouncementReadRepository announcementReadRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditService auditService;

    private Employee getEmployee(Authentication authentication) {
        return employeeRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new BadRequestException("Employee not found"));
    }

    public List<AnnouncementResponse> getAll(Authentication authentication) {
        Employee employee = getEmployee(authentication);
        Set<Long> readIds = announcementReadRepository.readAnnouncementIdsForEmployee(employee.getId());

        return announcementRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(a -> AnnouncementResponse.from(a, readIds.contains(a.getId())))
                .toList();
    }

    @Transactional
    public AnnouncementResponse create(AnnouncementRequest request, Authentication authentication) {
        Employee admin = getEmployee(authentication);

        if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
            throw new BadRequestException("Only admins can post announcements");
        }

        if (request.title() == null || request.title().isBlank()) {
            throw new BadRequestException("Title is required");
        }

        if (request.content() == null || request.content().isBlank()) {
            throw new BadRequestException("Content is required");
        }

        Announcement announcement = Announcement.builder()
                .title(request.title().trim())
                .content(request.content().trim())
                .createdByEmail(admin.getEmail())
                .createdByName(admin.getName())
                .createdAt(LocalDateTime.now())
                .build();

        Announcement saved = announcementRepository.save(announcement);

        auditService.log(
                admin.getEmail(),
                "CREATE_ANNOUNCEMENT",
                "ANNOUNCEMENT_ID:" + saved.getId(),
                "Posted announcement: " + saved.getTitle());

        return AnnouncementResponse.from(saved, false);
    }

    @Transactional
    public void delete(Long id, Authentication authentication) {
        Employee admin = getEmployee(authentication);

        if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
            throw new BadRequestException("Only admins can delete announcements");
        }

        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Announcement not found"));

        announcementRepository.delete(announcement);

        auditService.log(
                admin.getEmail(),
                "DELETE_ANNOUNCEMENT",
                "ANNOUNCEMENT_ID:" + id,
                "Deleted announcement: " + announcement.getTitle());
    }

    @Transactional
    public void markAsRead(Long id, Authentication authentication) {
        Employee employee = getEmployee(authentication);

        if (!announcementRepository.existsById(id)) {
            throw new BadRequestException("Announcement not found");
        }

        if (!announcementReadRepository.existsByAnnouncementIdAndEmployeeId(id, employee.getId())) {
            AnnouncementRead read = AnnouncementRead.builder()
                    .announcementId(id)
                    .employeeId(employee.getId())
                    .readAt(LocalDateTime.now())
                    .build();

            announcementReadRepository.save(read);
        }
    }
}

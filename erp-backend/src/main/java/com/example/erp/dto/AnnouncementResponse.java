package com.example.erp.dto;

import com.example.erp.entity.Announcement;

public record AnnouncementResponse(
        Long id,
        String title,
        String content,
        String createdByName,
        String createdByEmail,
        String createdAt,
        boolean read) {

    public static AnnouncementResponse from(Announcement a, boolean read) {
        return new AnnouncementResponse(
                a.getId(),
                a.getTitle(),
                a.getContent(),
                a.getCreatedByName(),
                a.getCreatedByEmail(),
                a.getCreatedAt().withNano(0).toString().replace("T", " "),
                read);
    }
}

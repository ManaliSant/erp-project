package com.example.erp.repository;

import com.example.erp.entity.HrApplication;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HrApplicationRepository extends JpaRepository<HrApplication, String> {
}
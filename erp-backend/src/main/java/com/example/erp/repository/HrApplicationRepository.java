package com.example.erp.repository;

import com.example.erp.entity.HrApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HrApplicationRepository extends JpaRepository<HrApplication, String> {

    List<HrApplication> findByEmployeeId(Long employeeId);
}
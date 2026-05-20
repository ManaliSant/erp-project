package com.example.erp.repository;

import com.example.erp.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    List<Employee> findByManager(String manager);

    long countByRoleIgnoreCase(String role);

    long countBySignedInTrue();

    Page<Employee> findByStatusIgnoreCase(String status, Pageable pageable);

    Page<Employee> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrDepartmentContainingIgnoreCase(
            String name,
            String email,
            String department,
            Pageable pageable);

    Page<Employee> findByStatusIgnoreCaseAndNameContainingIgnoreCaseOrStatusIgnoreCaseAndEmailContainingIgnoreCaseOrStatusIgnoreCaseAndDepartmentContainingIgnoreCase(
            String status1,
            String name,
            String status2,
            String email,
            String status3,
            String department,
            Pageable pageable);
}
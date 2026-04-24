package com.example.erp.init;

import com.example.erp.entity.Employee;
import com.example.erp.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedData(EmployeeRepository employeeRepository) {
        return args -> {
            if (employeeRepository.count() == 0) {
                employeeRepository.save(Employee.builder()
                        .id(1L)
                        .employeeCode("HR001")
                        .name("Aisha Thomas")
                        .email("aisha@company.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role("admin")
                        .department("Human Resources")
                        .designation("HR Manager")
                        .manager("Director HR")
                        .joinDate("2021-06-15")
                        .leavesRemaining(14)
                        .signedIn(false)
                        .lastSignIn("")
                        .lastSignOut("")
                        .status("Active")
                        .build());

                employeeRepository.save(Employee.builder()
                        .id(2L)
                        .employeeCode("EMP101")
                        .name("Rahul Menon")
                        .email("rahul@company.com")
                        .password(passwordEncoder.encode("emp123"))
                        .role("employee")
                        .department("Engineering")
                        .designation("Software Engineer")
                        .manager("Priya Nair")
                        .joinDate("2023-01-10")
                        .leavesRemaining(9)
                        .signedIn(false)
                        .lastSignIn("")
                        .lastSignOut("")
                        .status("Active")
                        .build());
            }
        };
    }
}
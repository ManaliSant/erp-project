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
            if (employeeRepository.count() > 0) {
                return;
            }

            String[] departments = {
                    "Human Resources",
                    "Engineering",
                    "Operations",
                    "Finance",
                    "Sales",
                    "Customer Support",
                    "Administration"
            };

            String[] firstNames = {
                    "Aisha", "Rahul", "Priya", "Arjun", "Neha", "Rohan", "Sneha",
                    "Karan", "Meera", "Vikram", "Ananya", "Siddharth", "Pooja",
                    "Amit", "Nisha", "Raj", "Divya", "Kavya", "Aditya", "Simran",
                    "Ishaan", "Tara", "Kabir", "Riya", "Varun", "Maya", "Dev",
                    "Anika", "Nikhil", "Sanya", "Farhan", "Zoya", "Harsh", "Ira",
                    "Manav", "Tanvi", "Yash", "Avni", "Reyansh", "Diya"
            };

            String[] lastNames = {
                    "Thomas", "Menon", "Nair", "Sharma", "Mehta", "Patel",
                    "Kapoor", "Verma", "Iyer", "Singh", "Chopra", "Das",
                    "Joshi", "Reddy", "Pillai", "Malhotra", "Bose", "Kumar",
                    "Fernandes", "Rao", "Mishra", "Gill", "Bhat", "Naidu"
            };

            // 5 ADMINS
            for (int i = 1; i <= 5; i++) {
                String firstName = firstNames[(i - 1) % firstNames.length];
                String lastName = lastNames[(i - 1) % lastNames.length];
                String fullName = firstName + " " + lastName;

                employeeRepository.save(Employee.builder()
                        .employeeCode(String.format("ADM%03d", i))
                        .name(fullName)
                        .email(("admin" + i + "." + firstName + "." + lastName + "@company.com").toLowerCase())
                        .password(passwordEncoder.encode("admin123"))
                        .role("ADMIN")
                        .department("Human Resources")
                        .designation("HR Admin")
                        .manager("CEO")
                        .joinDate("2021-01-" + String.format("%02d", ((i - 1) % 28) + 1))
                        .leavesRemaining(15)
                        .signedIn(false)
                        .lastSignIn("")
                        .lastSignOut("")
                        .status("Active")
                        .build());
            }

            // 45 MANAGERS
            for (int i = 1; i <= 45; i++) {
                String department = departments[(i - 1) % departments.length];

                String firstName = firstNames[(i + 5) % firstNames.length];
                String lastName = lastNames[(i + 3) % lastNames.length];
                String fullName = firstName + " " + lastName;

                employeeRepository.save(Employee.builder()
                        .employeeCode(String.format("MGR%03d", i))
                        .name(fullName)
                        .email(("manager" + i + "." + firstName + "." + lastName + "@company.com").toLowerCase())
                        .password(passwordEncoder.encode("manager123"))
                        .role("MANAGER")
                        .department(department)
                        .designation(department + " Manager")
                        .manager("Admin User " + (((i - 1) % 5) + 1))
                        .joinDate("2022-02-" + String.format("%02d", ((i - 1) % 28) + 1))
                        .leavesRemaining(12)
                        .signedIn(false)
                        .lastSignIn("")
                        .lastSignOut("")
                        .status("Active")
                        .build());
            }

            // 450 EMPLOYEES
            for (int i = 1; i <= 450; i++) {
                String department = departments[(i - 1) % departments.length];
                int managerNumber = ((i - 1) % 45) + 1;

                String firstName = firstNames[(i + 11) % firstNames.length];
                String lastName = lastNames[(i + 7) % lastNames.length];
                String fullName = firstName + " " + lastName;

                employeeRepository.save(Employee.builder()
                        .employeeCode(String.format("EMP%03d", i))
                        .name(fullName)
                        .email(("employee" + i + "." + firstName + "." + lastName + "@company.com").toLowerCase())
                        .password(passwordEncoder.encode("emp123"))
                        .role("EMPLOYEE")
                        .department(department)
                        .designation(department + " Executive")
                        .manager("Manager User " + managerNumber)
                        .joinDate("2023-03-" + String.format("%02d", ((i - 1) % 28) + 1))
                        .leavesRemaining(10)
                        .signedIn(false)
                        .lastSignIn("")
                        .lastSignOut("")
                        .status("Active")
                        .build());
            }
            System.out.println("✅ Finished seeding 500 employees");
        };

    }
}
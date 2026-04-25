package com.example.erp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableMethodSecurity
public class ErpBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ErpBackendApplication.class, args);
	}
}
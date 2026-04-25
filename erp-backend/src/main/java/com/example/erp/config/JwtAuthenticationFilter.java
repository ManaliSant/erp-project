package com.example.erp.config;

import com.example.erp.service.EmployeeUserDetailsService;
import com.example.erp.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final EmployeeUserDetailsService employeeUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        System.out.println("==== JWT FILTER START ====");
        System.out.println("REQUEST: " + request.getMethod() + " " + request.getRequestURI());
        System.out.println("AUTH HEADER: " + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("NO VALID AUTH HEADER");
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);
        String email = jwtService.extractUsername(jwt);

        System.out.println("EXTRACTED EMAIL: " + email);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = employeeUserDetailsService.loadUserByUsername(email);

            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);

                System.out.println("AUTHENTICATION SET: " + userDetails.getUsername());
            } else {
                System.out.println("INVALID TOKEN");
            }
        }

        System.out.println("FINAL AUTH USER: " + SecurityContextHolder.getContext().getAuthentication());
        System.out.println("==== JWT FILTER END ====");

        filterChain.doFilter(request, response);
    }
}
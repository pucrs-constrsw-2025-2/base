package com.constrsw.employees.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Component
@Order(1)
public class AuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private OAuthService oauthService;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                     FilterChain filterChain) throws ServletException, IOException {
        
        // Skip authentication for health and actuator endpoints
        String path = request.getRequestURI();
        if (path.contains("/actuator") || path.contains("/health") || path.contains("/docs")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Check if this is a POST, PUT, PATCH, or DELETE request to /employees endpoint
        String method = request.getMethod();
        boolean isModificationMethod = "POST".equals(method) || 
                                       "PUT".equals(method) || 
                                       "PATCH".equals(method) || 
                                       "DELETE".equals(method);
        
        // Only apply admin role check for modification methods on /employees endpoint
        // Note: path includes context-path (/api/v1), so we check for /employees
        boolean isEmployeesEndpoint = path.contains("/employees") && !path.contains("/tasks");
        boolean requiresAdminRole = isModificationMethod && isEmployeesEndpoint;
        
        if (!requiresAdminRole) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Extract token from Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
            return;
        }
        
        // Validate token
        try {
            OAuthValidationResponse validationResponse = oauthService.validateToken(authHeader)
                    .block(); // Blocking call in filter
            
            if (validationResponse == null || !validationResponse.isActive()) {
                sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Invalid or expired token");
                return;
            }
            
            // Store user info in request attribute
            request.setAttribute("user", validationResponse);
            request.setAttribute("userId", validationResponse.getSub());
            request.setAttribute("username", validationResponse.getPreferredUsername() != null ? 
                    validationResponse.getPreferredUsername() : validationResponse.getUsername());
            request.setAttribute("userRoles", validationResponse.getRoles());
            
            // Check if user has Administrador role
            List<String> userRoles = validationResponse.getRoles();
            boolean hasAdminRole = false;
            
            for (String userRole : userRoles) {
                if (userRole.equalsIgnoreCase("Administrador") ||
                    userRole.toLowerCase().contains("administrador") ||
                    userRole.toLowerCase().contains("admin")) {
                    hasAdminRole = true;
                    break;
                }
            }
            
            if (!hasAdminRole) {
                sendErrorResponse(response, HttpStatus.FORBIDDEN, 
                        "Access denied. Required role: Administrador");
                return;
            }
            
            filterChain.doFilter(request, response);
            
        } catch (Exception e) {
            logger.error("Token validation failed", e);
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Token validation failed: " + e.getMessage());
        }
    }
    
    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message) 
            throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        Map<String, Object> errorResponse = Map.of(
            "error", status.getReasonPhrase(),
            "message", message,
            "status", status.value()
        );
        
        objectMapper.writeValue(response.getWriter(), errorResponse);
    }
}


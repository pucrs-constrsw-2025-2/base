package com.constrsw.employees.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class ErrorResponse {
    
    private String error;
    private String code;
    private LocalDateTime timestamp;
    private Map<String, Object> details;
    
    // Constructors
    public ErrorResponse() {
        this.timestamp = LocalDateTime.now();
    }
    
    public ErrorResponse(String error) {
        this();
        this.error = error;
    }
    
    public ErrorResponse(String error, String code) {
        this(error);
        this.code = code;
    }
    
    public ErrorResponse(String error, String code, Map<String, Object> details) {
        this(error, code);
        this.details = details;
    }
    
    // Getters and Setters
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public Map<String, Object> getDetails() {
        return details;
    }
    
    public void setDetails(Map<String, Object> details) {
        this.details = details;
    }
}







package com.constrsw.employees.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class TaskUpdateRequest {
    
    @Size(min = 1, max = 1000, message = "Description must be between 1 and 1000 characters")
    private String description;
    
    private LocalDate startDate;
    
    private LocalDate expectedEndDate;
    
    private LocalDate actualEndDate;
    
    // Constructors
    public TaskUpdateRequest() {}
    
    // Getters and Setters
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getExpectedEndDate() {
        return expectedEndDate;
    }
    
    public void setExpectedEndDate(LocalDate expectedEndDate) {
        this.expectedEndDate = expectedEndDate;
    }
    
    public LocalDate getActualEndDate() {
        return actualEndDate;
    }
    
    public void setActualEndDate(LocalDate actualEndDate) {
        this.actualEndDate = actualEndDate;
    }
}





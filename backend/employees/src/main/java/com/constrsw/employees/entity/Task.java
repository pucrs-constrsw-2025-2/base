package com.constrsw.employees.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.Objects;

@Document(collection = "Tasks")
public class Task {
    
    @Id
    private String id;
    
    @NotBlank(message = "Description is required")
    @Size(min = 1, max = 1000, message = "Description must be between 1 and 1000 characters")
    private String description;
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    @NotNull(message = "Expected end date is required")
    private LocalDate expectedEndDate;
    
    private LocalDate actualEndDate;
    
    @Field("employee_id")
    private String employeeId;
    
    // Constructors
    public Task() {}
    
    public Task(String description, LocalDate startDate, LocalDate expectedEndDate) {
        this.description = description;
        this.startDate = startDate;
        this.expectedEndDate = expectedEndDate;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
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
    
    public String getEmployeeId() {
        return employeeId;
    }
    
    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }
    
    // Helper methods
    public boolean isCompleted() {
        return actualEndDate != null;
    }
    
    public boolean isOverdue() {
        return !isCompleted() && LocalDate.now().isAfter(expectedEndDate);
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Task task = (Task) o;
        return Objects.equals(id, task.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    
    @Override
    public String toString() {
        return "Task{" +
                "id='" + id + '\'' +
                ", description='" + description + '\'' +
                ", startDate=" + startDate +
                ", expectedEndDate=" + expectedEndDate +
                ", actualEndDate=" + actualEndDate +
                ", employeeId='" + employeeId + '\'' +
                '}';
    }
}





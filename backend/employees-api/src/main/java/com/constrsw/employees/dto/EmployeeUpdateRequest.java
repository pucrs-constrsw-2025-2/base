package com.constrsw.employees.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class EmployeeUpdateRequest {
    
    @DecimalMin(value = "0.0", message = "Salary must be non-negative")
    private BigDecimal salary;
    
    @Size(min = 1, max = 100, message = "Organizational unit must be between 1 and 100 characters")
    private String organizationalUnit;
    
    @Valid
    private RoomReferenceDto room;
    
    // Constructors
    public EmployeeUpdateRequest() {}
    
    // Getters and Setters
    public BigDecimal getSalary() {
        return salary;
    }
    
    public void setSalary(BigDecimal salary) {
        this.salary = salary;
    }
    
    public String getOrganizationalUnit() {
        return organizationalUnit;
    }
    
    public void setOrganizationalUnit(String organizationalUnit) {
        this.organizationalUnit = organizationalUnit;
    }
    
    public RoomReferenceDto getRoom() {
        return room;
    }
    
    public void setRoom(RoomReferenceDto room) {
        this.room = room;
    }
}





package com.constrsw.employees.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class EmployeeCreateRequest {
    
    @NotNull(message = "Contract number is required")
    private Long contractNumber;
    
    @NotBlank(message = "Name is required")
    @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    private String name;
    
    @NotBlank(message = "Role is required")
    @Size(min = 1, max = 100, message = "Role must be between 1 and 100 characters")
    private String role;
    
    @DecimalMin(value = "0.0", message = "Salary must be non-negative")
    private BigDecimal salary;
    
    @Size(min = 1, max = 100, message = "Organizational unit must be between 1 and 100 characters")
    private String organizationalUnit;
    
    @Valid
    private RoomReferenceDto room;
    
    // Constructors
    public EmployeeCreateRequest() {}
    
    // Getters and Setters
    public Long getContractNumber() {
        return contractNumber;
    }
    
    public void setContractNumber(Long contractNumber) {
        this.contractNumber = contractNumber;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
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





package com.constrsw.employees.dto;

import java.math.BigDecimal;
import java.util.List;

public class EmployeeResponse {
    
    private String id;
    private Long contractNumber;
    private String name;
    private String role;
    private BigDecimal salary;
    private String organizationalUnit;
    private List<TaskResponse> tasks;
    private RoomReferenceDto room;
    
    // Constructors
    public EmployeeResponse() {}
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
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
    
    public List<TaskResponse> getTasks() {
        return tasks;
    }
    
    public void setTasks(List<TaskResponse> tasks) {
        this.tasks = tasks;
    }
    
    public RoomReferenceDto getRoom() {
        return room;
    }
    
    public void setRoom(RoomReferenceDto room) {
        this.room = room;
    }
}





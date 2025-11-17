package com.constrsw.employees.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Document(collection = "Employees")
public class Employee {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
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
    
    private List<Task> tasks = new ArrayList<>();
    
    private RoomReference room;
    
    // Constructors
    public Employee() {}
    
    public Employee(Long contractNumber, String name, String role) {
        this.contractNumber = contractNumber;
        this.name = name;
        this.role = role;
    }
    
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
    
    public List<Task> getTasks() {
        return tasks;
    }
    
    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }
    
    public RoomReference getRoom() {
        return room;
    }
    
    public void setRoom(RoomReference room) {
        this.room = room;
    }
    
    // Helper methods
    public void addTask(Task task) {
        if (tasks == null) {
            tasks = new ArrayList<>();
        }
        tasks.add(task);
    }
    
    public void removeTask(Task task) {
        if (tasks != null) {
            tasks.remove(task);
        }
    }
    
    public Task findTaskById(String taskId) {
        if (tasks == null) {
            return null;
        }
        return tasks.stream()
                .filter(task -> Objects.equals(task.getId(), taskId))
                .findFirst()
                .orElse(null);
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Employee employee = (Employee) o;
        return Objects.equals(id, employee.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    
    @Override
    public String toString() {
        return "Employee{" +
                "id='" + id + '\'' +
                ", contractNumber=" + contractNumber +
                ", name='" + name + '\'' +
                ", role='" + role + '\'' +
                ", salary=" + salary +
                ", organizationalUnit='" + organizationalUnit + '\'' +
                ", tasksCount=" + (tasks != null ? tasks.size() : 0) +
                ", room=" + room +
                '}';
    }
}





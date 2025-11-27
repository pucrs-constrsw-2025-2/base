package com.constrsw.employees.controller;

import com.constrsw.employees.dto.*;
import com.constrsw.employees.security.RequiresRole;
import com.constrsw.employees.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {
    
    @Autowired
    private EmployeeService employeeService;
    
    @PostMapping
    @RequiresRole("Administrador")
    public ResponseEntity<EmployeeResponse> createEmployee(@Valid @RequestBody EmployeeCreateRequest request) {
        EmployeeResponse response = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    public ResponseEntity<EmployeeListResponse> getAllEmployees(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search) {
        
        EmployeeListResponse response = employeeService.getAllEmployees(page, limit, search);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> getEmployeeById(@PathVariable String id) {
        EmployeeResponse response = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @RequiresRole("Administrador")
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @PathVariable String id,
            @Valid @RequestBody EmployeeUpdateRequest request) {
        EmployeeResponse response = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/{id}")
    @RequiresRole("Administrador")
    public ResponseEntity<EmployeeResponse> patchEmployee(
            @PathVariable String id,
            @RequestBody EmployeeUpdateRequest request) {
        EmployeeResponse response = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @RequiresRole("Administrador")
    public ResponseEntity<Void> deleteEmployee(@PathVariable String id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<TaskResponse>> getEmployeeTasks(
            @PathVariable String id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        List<TaskResponse> response = employeeService.getEmployeeTasks(id, page, limit, description, startDate, endDate);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/tasks")
    public ResponseEntity<TaskResponse> createEmployeeTask(
            @PathVariable String id,
            @Valid @RequestBody TaskCreateRequest request) {
        TaskResponse response = employeeService.createEmployeeTask(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{employeeId}/tasks/{taskId}")
    public ResponseEntity<TaskResponse> getEmployeeTask(
            @PathVariable String employeeId,
            @PathVariable String taskId) {
        TaskResponse response = employeeService.getEmployeeTask(employeeId, taskId);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{employeeId}/tasks/{taskId}")
    public ResponseEntity<TaskResponse> updateEmployeeTask(
            @PathVariable String employeeId,
            @PathVariable String taskId,
            @Valid @RequestBody TaskUpdateRequest request) {
        TaskResponse response = employeeService.updateEmployeeTask(employeeId, taskId, request);
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/{employeeId}/tasks/{taskId}")
    public ResponseEntity<TaskResponse> patchEmployeeTask(
            @PathVariable String employeeId,
            @PathVariable String taskId,
            @RequestBody TaskUpdateRequest request) {
        TaskResponse response = employeeService.updateEmployeeTask(employeeId, taskId, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{employeeId}/tasks/{taskId}")
    public ResponseEntity<Void> deleteEmployeeTask(
            @PathVariable String employeeId,
            @PathVariable String taskId) {
        employeeService.deleteEmployeeTask(employeeId, taskId);
        return ResponseEntity.noContent().build();
    }
}







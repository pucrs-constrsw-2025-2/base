package com.constrsw.employees.service;

import com.constrsw.employees.dto.*;
import com.constrsw.employees.entity.Employee;
import com.constrsw.employees.entity.Task;
import com.constrsw.employees.exception.EmployeeNotFoundException;
import com.constrsw.employees.exception.DuplicateContractNumberException;
import com.constrsw.employees.mapper.EmployeeMapper;
import com.constrsw.employees.repository.EmployeeRepository;
import com.constrsw.employees.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EmployeeService {
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private EmployeeMapper employeeMapper;
    
    public EmployeeResponse createEmployee(EmployeeCreateRequest request) {
        // Check if contract number already exists
        if (employeeRepository.existsByContractNumber(request.getContractNumber())) {
            throw new DuplicateContractNumberException("Employee with contract number " + request.getContractNumber() + " already exists");
        }
        
        Employee employee = employeeMapper.toEntity(request);
        Employee savedEmployee = employeeRepository.save(employee);
        return employeeMapper.toResponse(savedEmployee);
    }
    
    @Transactional(readOnly = true)
    public EmployeeListResponse getAllEmployees(int page, int limit, String search) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Employee> employeePage;
        
        if (search != null && !search.trim().isEmpty()) {
            employeePage = employeeRepository.findByContractNumberOrNameOrOrganizationalUnit(search.trim(), pageable);
        } else {
            employeePage = employeeRepository.findAll(pageable);
        }
        
        List<EmployeeResponse> employees = employeeMapper.toResponseList(employeePage.getContent());
        return new EmployeeListResponse(employees, employeePage.getTotalElements(), page, limit);
    }
    
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(String id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + id));
        return employeeMapper.toResponse(employee);
    }
    
    public EmployeeResponse updateEmployee(String id, EmployeeUpdateRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + id));
        
        employeeMapper.updateEntity(employee, request);
        Employee updatedEmployee = employeeRepository.save(employee);
        return employeeMapper.toResponse(updatedEmployee);
    }
    
    public void deleteEmployee(String id) {
        if (!employeeRepository.existsById(id)) {
            throw new EmployeeNotFoundException("Employee not found with id: " + id);
        }
        
        // Delete all tasks associated with this employee
        taskRepository.deleteByEmployeeId(id);
        
        // Delete the employee
        employeeRepository.deleteById(id);
    }
    
    @Transactional(readOnly = true)
    public List<TaskResponse> getEmployeeTasks(String employeeId, int page, int limit, String description, String startDate, String endDate) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new EmployeeNotFoundException("Employee not found with id: " + employeeId);
        }
        
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<Task> taskPage;
        
        if (description != null && !description.trim().isEmpty()) {
            taskPage = taskRepository.findByEmployeeIdAndDescriptionContaining(employeeId, description.trim(), pageable);
        } else if (startDate != null && endDate != null) {
            try {
                java.time.LocalDate start = java.time.LocalDate.parse(startDate);
                java.time.LocalDate end = java.time.LocalDate.parse(endDate);
                taskPage = taskRepository.findByEmployeeIdAndDateRange(employeeId, start, end, pageable);
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid date format. Use YYYY-MM-DD");
            }
        } else {
            taskPage = taskRepository.findByEmployeeId(employeeId, pageable);
        }
        
        return employeeMapper.toTaskResponseList(taskPage.getContent());
    }
    
    public TaskResponse createEmployeeTask(String employeeId, TaskCreateRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + employeeId));
        
        Task task = new Task();
        task.setDescription(request.getDescription());
        task.setStartDate(request.getStartDate());
        task.setExpectedEndDate(request.getExpectedEndDate());
        task.setActualEndDate(request.getActualEndDate());
        task.setEmployeeId(employeeId);
        
        Task savedTask = taskRepository.save(task);
        
        // Add task to employee's task list
        employee.addTask(savedTask);
        employeeRepository.save(employee);
        
        return employeeMapper.toTaskResponse(savedTask);
    }
    
    @Transactional(readOnly = true)
    public TaskResponse getEmployeeTask(String employeeId, String taskId) {
        Task task = taskRepository.findByIdAndEmployeeId(taskId, employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Task not found with id: " + taskId + " for employee: " + employeeId));
        return employeeMapper.toTaskResponse(task);
    }
    
    public TaskResponse updateEmployeeTask(String employeeId, String taskId, TaskUpdateRequest request) {
        Task task = taskRepository.findByIdAndEmployeeId(taskId, employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Task not found with id: " + taskId + " for employee: " + employeeId));
        
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getStartDate() != null) {
            task.setStartDate(request.getStartDate());
        }
        if (request.getExpectedEndDate() != null) {
            task.setExpectedEndDate(request.getExpectedEndDate());
        }
        if (request.getActualEndDate() != null) {
            task.setActualEndDate(request.getActualEndDate());
        }
        
        Task updatedTask = taskRepository.save(task);
        return employeeMapper.toTaskResponse(updatedTask);
    }
    
    public void deleteEmployeeTask(String employeeId, String taskId) {
        Task task = taskRepository.findByIdAndEmployeeId(taskId, employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Task not found with id: " + taskId + " for employee: " + employeeId));
        
        // Remove task from employee's task list
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + employeeId));
        employee.removeTask(task);
        employeeRepository.save(employee);
        
        // Delete the task
        taskRepository.deleteById(taskId);
    }
}







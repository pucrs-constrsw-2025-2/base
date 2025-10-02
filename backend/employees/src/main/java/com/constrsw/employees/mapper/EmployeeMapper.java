package com.constrsw.employees.mapper;

import com.constrsw.employees.dto.*;
import com.constrsw.employees.entity.Employee;
import com.constrsw.employees.entity.RoomReference;
import com.constrsw.employees.entity.Task;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class EmployeeMapper {
    
    public Employee toEntity(EmployeeCreateRequest request) {
        Employee employee = new Employee();
        employee.setContractNumber(request.getContractNumber());
        employee.setName(request.getName());
        employee.setRole(request.getRole());
        employee.setSalary(request.getSalary());
        employee.setOrganizationalUnit(request.getOrganizationalUnit());
        
        if (request.getRoom() != null) {
            employee.setRoom(toRoomReference(request.getRoom()));
        }
        
        return employee;
    }
    
    public void updateEntity(Employee employee, EmployeeUpdateRequest request) {
        if (request.getSalary() != null) {
            employee.setSalary(request.getSalary());
        }
        if (request.getOrganizationalUnit() != null) {
            employee.setOrganizationalUnit(request.getOrganizationalUnit());
        }
        if (request.getRoom() != null) {
            employee.setRoom(toRoomReference(request.getRoom()));
        }
    }
    
    public EmployeeResponse toResponse(Employee employee) {
        EmployeeResponse response = new EmployeeResponse();
        response.setId(employee.getId());
        response.setContractNumber(employee.getContractNumber());
        response.setName(employee.getName());
        response.setRole(employee.getRole());
        response.setSalary(employee.getSalary());
        response.setOrganizationalUnit(employee.getOrganizationalUnit());
        
        if (employee.getTasks() != null) {
            response.setTasks(employee.getTasks().stream()
                    .map(this::toTaskResponse)
                    .collect(Collectors.toList()));
        }
        
        if (employee.getRoom() != null) {
            response.setRoom(toRoomReferenceDto(employee.getRoom()));
        }
        
        return response;
    }
    
    public List<EmployeeResponse> toResponseList(List<Employee> employees) {
        return employees.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    public TaskResponse toTaskResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setDescription(task.getDescription());
        response.setStartDate(task.getStartDate());
        response.setExpectedEndDate(task.getExpectedEndDate());
        response.setActualEndDate(task.getActualEndDate());
        response.setEmployeeId(task.getEmployeeId());
        return response;
    }
    
    public List<TaskResponse> toTaskResponseList(List<Task> tasks) {
        return tasks.stream()
                .map(this::toTaskResponse)
                .collect(Collectors.toList());
    }
    
    private RoomReference toRoomReference(RoomReferenceDto dto) {
        if (dto == null) {
            return null;
        }
        return new RoomReference(dto.getIdRoom());
    }
    
    private RoomReferenceDto toRoomReferenceDto(RoomReference roomReference) {
        if (roomReference == null) {
            return null;
        }
        return new RoomReferenceDto(roomReference.getIdRoom());
    }
}







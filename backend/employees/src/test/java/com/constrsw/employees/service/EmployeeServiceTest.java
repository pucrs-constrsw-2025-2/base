package com.constrsw.employees.service;

import com.constrsw.employees.dto.*;
import com.constrsw.employees.entity.Employee;
import com.constrsw.employees.entity.Task;
import com.constrsw.employees.exception.DuplicateContractNumberException;
import com.constrsw.employees.exception.EmployeeNotFoundException;
import com.constrsw.employees.mapper.EmployeeMapper;
import com.constrsw.employees.repository.EmployeeRepository;
import com.constrsw.employees.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmployeeService Unit Tests")
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private EmployeeMapper employeeMapper;

    @InjectMocks
    private EmployeeService employeeService;

    private Employee employee;
    private EmployeeCreateRequest createRequest;
    private EmployeeUpdateRequest updateRequest;
    private Task task;

    @BeforeEach
    void setUp() {
        employee = new Employee();
        employee.setId("employee-123");
        employee.setContractNumber(12345L);
        employee.setName("João Silva");
        employee.setRole("Desenvolvedor");
        employee.setSalary(new BigDecimal("5000.00"));
        employee.setOrganizationalUnit("TI");

        createRequest = new EmployeeCreateRequest();
        createRequest.setContractNumber(12345L);
        createRequest.setName("João Silva");
        createRequest.setRole("Desenvolvedor");
        createRequest.setSalary(new BigDecimal("5000.00"));
        createRequest.setOrganizationalUnit("TI");

        updateRequest = new EmployeeUpdateRequest();
        updateRequest.setSalary(new BigDecimal("6000.00"));
        updateRequest.setOrganizationalUnit("RH");

        task = new Task();
        task.setId("task-123");
        task.setDescription("Implementar feature X");
        task.setStartDate(LocalDate.now());
        task.setExpectedEndDate(LocalDate.now().plusDays(7));
        task.setEmployeeId("employee-123");
    }

    @Test
    @DisplayName("Deve criar um funcionário com sucesso")
    void shouldCreateEmployeeSuccessfully() {
        // Arrange
        when(employeeRepository.existsByContractNumber(12345L)).thenReturn(false);
        when(employeeMapper.toEntity(createRequest)).thenReturn(employee);
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);
        
        EmployeeResponse expectedResponse = new EmployeeResponse();
        expectedResponse.setId("employee-123");
        expectedResponse.setContractNumber(12345L);
        expectedResponse.setName("João Silva");
        when(employeeMapper.toResponse(employee)).thenReturn(expectedResponse);

        // Act
        EmployeeResponse result = employeeService.createEmployee(createRequest);

        // Assert
        assertNotNull(result);
        assertEquals("employee-123", result.getId());
        verify(employeeRepository).existsByContractNumber(12345L);
        verify(employeeRepository).save(employee);
        verify(employeeMapper).toResponse(employee);
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar criar funcionário com contract number duplicado")
    void shouldThrowExceptionWhenContractNumberExists() {
        // Arrange
        when(employeeRepository.existsByContractNumber(12345L)).thenReturn(true);

        // Act & Assert
        assertThrows(DuplicateContractNumberException.class, () -> {
            employeeService.createEmployee(createRequest);
        });

        verify(employeeRepository).existsByContractNumber(12345L);
        verify(employeeRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve listar todos os funcionários com paginação")
    void shouldGetAllEmployeesWithPagination() {
        // Arrange
        List<Employee> employees = List.of(employee);
        Pageable pageable = PageRequest.of(0, 10);
        Page<Employee> employeePage = new PageImpl<>(employees, pageable, 1);

        when(employeeRepository.findAll(pageable)).thenReturn(employeePage);
        
        EmployeeResponse response = new EmployeeResponse();
        response.setId("employee-123");
        when(employeeMapper.toResponseList(employees)).thenReturn(List.of(response));

        // Act
        EmployeeListResponse result = employeeService.getAllEmployees(1, 10, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getEmployees().size());
        assertEquals(1, result.getTotal());
        verify(employeeRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Deve buscar funcionários com filtro de busca")
    void shouldSearchEmployeesWithFilter() {
        // Arrange
        String searchTerm = "João";
        List<Employee> employees = List.of(employee);
        Pageable pageable = PageRequest.of(0, 10);
        Page<Employee> employeePage = new PageImpl<>(employees, pageable, 1);

        when(employeeRepository.findByContractNumberOrNameOrOrganizationalUnit(searchTerm, pageable))
                .thenReturn(employeePage);
        
        EmployeeResponse response = new EmployeeResponse();
        response.setId("employee-123");
        when(employeeMapper.toResponseList(employees)).thenReturn(List.of(response));

        // Act
        EmployeeListResponse result = employeeService.getAllEmployees(1, 10, searchTerm);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getEmployees().size());
        verify(employeeRepository).findByContractNumberOrNameOrOrganizationalUnit(searchTerm, pageable);
    }

    @Test
    @DisplayName("Deve buscar funcionário por ID com sucesso")
    void shouldGetEmployeeByIdSuccessfully() {
        // Arrange
        when(employeeRepository.findById("employee-123")).thenReturn(Optional.of(employee));
        
        EmployeeResponse expectedResponse = new EmployeeResponse();
        expectedResponse.setId("employee-123");
        when(employeeMapper.toResponse(employee)).thenReturn(expectedResponse);

        // Act
        EmployeeResponse result = employeeService.getEmployeeById("employee-123");

        // Assert
        assertNotNull(result);
        assertEquals("employee-123", result.getId());
        verify(employeeRepository).findById("employee-123");
    }

    @Test
    @DisplayName("Deve lançar exceção ao buscar funcionário inexistente")
    void shouldThrowExceptionWhenEmployeeNotFound() {
        // Arrange
        when(employeeRepository.findById("non-existent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EmployeeNotFoundException.class, () -> {
            employeeService.getEmployeeById("non-existent");
        });

        verify(employeeRepository).findById("non-existent");
    }

    @Test
    @DisplayName("Deve atualizar funcionário com sucesso")
    void shouldUpdateEmployeeSuccessfully() {
        // Arrange
        when(employeeRepository.findById("employee-123")).thenReturn(Optional.of(employee));
        when(employeeRepository.save(employee)).thenReturn(employee);
        
        EmployeeResponse expectedResponse = new EmployeeResponse();
        expectedResponse.setId("employee-123");
        expectedResponse.setSalary(new BigDecimal("6000.00"));
        when(employeeMapper.toResponse(employee)).thenReturn(expectedResponse);

        // Act
        EmployeeResponse result = employeeService.updateEmployee("employee-123", updateRequest);

        // Assert
        assertNotNull(result);
        verify(employeeRepository).findById("employee-123");
        verify(employeeMapper).updateEntity(employee, updateRequest);
        verify(employeeRepository).save(employee);
    }

    @Test
    @DisplayName("Deve deletar funcionário e suas tarefas")
    void shouldDeleteEmployeeAndTasks() {
        // Arrange
        when(employeeRepository.existsById("employee-123")).thenReturn(true);
        doNothing().when(taskRepository).deleteByEmployeeId("employee-123");
        doNothing().when(employeeRepository).deleteById("employee-123");

        // Act
        employeeService.deleteEmployee("employee-123");

        // Assert
        verify(employeeRepository).existsById("employee-123");
        verify(taskRepository).deleteByEmployeeId("employee-123");
        verify(employeeRepository).deleteById("employee-123");
    }

    @Test
    @DisplayName("Deve lançar exceção ao deletar funcionário inexistente")
    void shouldThrowExceptionWhenDeletingNonExistentEmployee() {
        // Arrange
        when(employeeRepository.existsById("non-existent")).thenReturn(false);

        // Act & Assert
        assertThrows(EmployeeNotFoundException.class, () -> {
            employeeService.deleteEmployee("non-existent");
        });

        verify(employeeRepository).existsById("non-existent");
        verify(taskRepository, never()).deleteByEmployeeId(any());
        verify(employeeRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Deve listar tarefas de um funcionário")
    void shouldGetEmployeeTasks() {
        // Arrange
        when(employeeRepository.existsById("employee-123")).thenReturn(true);
        
        List<Task> tasks = List.of(task);
        Pageable pageable = PageRequest.of(0, 10);
        Page<Task> taskPage = new PageImpl<>(tasks, pageable, 1);
        
        when(taskRepository.findByEmployeeId("employee-123", pageable)).thenReturn(taskPage);
        
        TaskResponse taskResponse = new TaskResponse();
        taskResponse.setId("task-123");
        when(employeeMapper.toTaskResponseList(tasks)).thenReturn(List.of(taskResponse));

        // Act
        List<TaskResponse> result = employeeService.getEmployeeTasks("employee-123", 1, 10, null, null, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(employeeRepository).existsById("employee-123");
        verify(taskRepository).findByEmployeeId("employee-123", pageable);
    }

    @Test
    @DisplayName("Deve criar tarefa para funcionário")
    void shouldCreateEmployeeTask() {
        // Arrange
        TaskCreateRequest taskRequest = new TaskCreateRequest();
        taskRequest.setDescription("Nova tarefa");
        taskRequest.setStartDate(LocalDate.now());
        taskRequest.setExpectedEndDate(LocalDate.now().plusDays(7));

        when(employeeRepository.findById("employee-123")).thenReturn(Optional.of(employee));
        when(taskRepository.save(any(Task.class))).thenReturn(task);
        when(employeeRepository.save(employee)).thenReturn(employee);
        
        TaskResponse taskResponse = new TaskResponse();
        taskResponse.setId("task-123");
        when(employeeMapper.toTaskResponse(task)).thenReturn(taskResponse);

        // Act
        TaskResponse result = employeeService.createEmployeeTask("employee-123", taskRequest);

        // Assert
        assertNotNull(result);
        verify(employeeRepository).findById("employee-123");
        verify(taskRepository).save(any(Task.class));
        verify(employeeRepository).save(employee);
    }

    @Test
    @DisplayName("Deve atualizar tarefa de funcionário")
    void shouldUpdateEmployeeTask() {
        // Arrange
        TaskUpdateRequest updateRequest = new TaskUpdateRequest();
        updateRequest.setDescription("Tarefa atualizada");

        when(taskRepository.findByIdAndEmployeeId("task-123", "employee-123"))
                .thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);
        
        TaskResponse taskResponse = new TaskResponse();
        taskResponse.setId("task-123");
        taskResponse.setDescription("Tarefa atualizada");
        when(employeeMapper.toTaskResponse(task)).thenReturn(taskResponse);

        // Act
        TaskResponse result = employeeService.updateEmployeeTask("employee-123", "task-123", updateRequest);

        // Assert
        assertNotNull(result);
        verify(taskRepository).findByIdAndEmployeeId("task-123", "employee-123");
        verify(taskRepository).save(task);
    }

    @Test
    @DisplayName("Deve deletar tarefa de funcionário")
    void shouldDeleteEmployeeTask() {
        // Arrange
        when(taskRepository.findByIdAndEmployeeId("task-123", "employee-123"))
                .thenReturn(Optional.of(task));
        when(employeeRepository.findById("employee-123")).thenReturn(Optional.of(employee));
        when(employeeRepository.save(employee)).thenReturn(employee);
        doNothing().when(taskRepository).deleteById("task-123");

        // Act
        employeeService.deleteEmployeeTask("employee-123", "task-123");

        // Assert
        verify(taskRepository).findByIdAndEmployeeId("task-123", "employee-123");
        verify(employeeRepository).findById("employee-123");
        verify(employeeRepository).save(employee);
        verify(taskRepository).deleteById("task-123");
    }
}


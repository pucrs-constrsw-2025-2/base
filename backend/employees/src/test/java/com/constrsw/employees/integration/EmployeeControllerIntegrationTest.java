package com.constrsw.employees.integration;

import com.constrsw.employees.entity.Employee;
import com.constrsw.employees.entity.Task;
import com.constrsw.employees.repository.EmployeeRepository;
import com.constrsw.employees.repository.TaskRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
@DisplayName("EmployeeController Integration Tests")
class EmployeeControllerIntegrationTest {

    @Container
    static MongoDBContainer mongoDBContainer = new MongoDBContainer(DockerImageName.parse("mongo:7.0"))
            .withReuse(true);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri", mongoDBContainer::getReplicaSetUrl);
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private TaskRepository taskRepository;

    private Employee testEmployee;

    @BeforeEach
    void setUp() {
        employeeRepository.deleteAll();
        taskRepository.deleteAll();

        testEmployee = new Employee();
        testEmployee.setContractNumber(12345L);
        testEmployee.setName("João Silva");
        testEmployee.setRole("Desenvolvedor");
        testEmployee.setSalary(new BigDecimal("5000.00"));
        testEmployee.setOrganizationalUnit("TI");
        testEmployee = employeeRepository.save(testEmployee);
    }

    @Test
    @DisplayName("POST /employees - Deve criar funcionário com sucesso")
    void shouldCreateEmployee() throws Exception {
        String requestBody = """
            {
                "contractNumber": 67890,
                "name": "Maria Santos",
                "role": "Analista",
                "salary": 6000.00,
                "organizationalUnit": "RH"
            }
            """;

        mockMvc.perform(post("/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.contractNumber").value(67890))
                .andExpect(jsonPath("$.name").value("Maria Santos"))
                .andExpect(jsonPath("$.role").value("Analista"));
    }

    @Test
    @DisplayName("POST /employees - Deve retornar erro ao criar funcionário com contract number duplicado")
    void shouldReturnErrorWhenContractNumberExists() throws Exception {
        String requestBody = """
            {
                "contractNumber": 12345,
                "name": "Outro Funcionário",
                "role": "Gerente"
            }
            """;

        mockMvc.perform(post("/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /employees - Deve listar funcionários com paginação")
    void shouldGetAllEmployees() throws Exception {
        mockMvc.perform(get("/employees")
                        .param("page", "1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employees").isArray())
                .andExpect(jsonPath("$.employees", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.total").exists())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.limit").value(10));
    }

    @Test
    @DisplayName("GET /employees?search=João - Deve buscar funcionários por termo")
    void shouldSearchEmployees() throws Exception {
        mockMvc.perform(get("/employees")
                        .param("page", "1")
                        .param("limit", "10")
                        .param("search", "João"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employees", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.employees[0].name", containsStringIgnoringCase("João")));
    }

    @Test
    @DisplayName("GET /employees/{id} - Deve buscar funcionário por ID")
    void shouldGetEmployeeById() throws Exception {
        mockMvc.perform(get("/employees/{id}", testEmployee.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testEmployee.getId()))
                .andExpect(jsonPath("$.name").value("João Silva"))
                .andExpect(jsonPath("$.contractNumber").value(12345));
    }

    @Test
    @DisplayName("GET /employees/{id} - Deve retornar 404 para funcionário inexistente")
    void shouldReturn404ForNonExistentEmployee() throws Exception {
        mockMvc.perform(get("/employees/non-existent-id"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /employees/{id} - Deve atualizar funcionário completamente")
    void shouldUpdateEmployee() throws Exception {
        String requestBody = """
            {
                "salary": 7000.00,
                "organizationalUnit": "Financeiro"
            }
            """;

        mockMvc.perform(put("/employees/{id}", testEmployee.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.salary").value(7000.00))
                .andExpect(jsonPath("$.organizationalUnit").value("Financeiro"));
    }

    @Test
    @DisplayName("PATCH /employees/{id} - Deve atualizar funcionário parcialmente")
    void shouldPartiallyUpdateEmployee() throws Exception {
        String requestBody = """
            {
                "salary": 8000.00
            }
            """;

        mockMvc.perform(patch("/employees/{id}", testEmployee.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.salary").value(8000.00));
    }

    @Test
    @DisplayName("DELETE /employees/{id} - Deve deletar funcionário")
    void shouldDeleteEmployee() throws Exception {
        mockMvc.perform(delete("/employees/{id}", testEmployee.getId()))
                .andExpect(status().isNoContent());

        // Verificar que foi deletado
        mockMvc.perform(get("/employees/{id}", testEmployee.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /employees/{id}/tasks - Deve listar tarefas do funcionário")
    void shouldGetEmployeeTasks() throws Exception {
        // Criar uma tarefa para o funcionário
        Task task = new Task();
        task.setDescription("Tarefa de teste");
        task.setStartDate(LocalDate.now());
        task.setExpectedEndDate(LocalDate.now().plusDays(7));
        task.setEmployeeId(testEmployee.getId());
        taskRepository.save(task);

        mockMvc.perform(get("/employees/{id}/tasks", testEmployee.getId())
                        .param("page", "1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("POST /employees/{id}/tasks - Deve criar tarefa para funcionário")
    void shouldCreateEmployeeTask() throws Exception {
        String requestBody = """
            {
                "description": "Nova tarefa",
                "startDate": "2024-01-01",
                "expectedEndDate": "2024-01-08"
            }
            """;

        mockMvc.perform(post("/employees/{id}/tasks", testEmployee.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.description").value("Nova tarefa"))
                .andExpect(jsonPath("$.employeeId").value(testEmployee.getId()));
    }

    @Test
    @DisplayName("GET /employees/{employeeId}/tasks/{taskId} - Deve buscar tarefa específica")
    void shouldGetEmployeeTask() throws Exception {
        Task task = new Task();
        task.setDescription("Tarefa específica");
        task.setStartDate(LocalDate.now());
        task.setExpectedEndDate(LocalDate.now().plusDays(7));
        task.setEmployeeId(testEmployee.getId());
        task = taskRepository.save(task);

        mockMvc.perform(get("/employees/{employeeId}/tasks/{taskId}", 
                        testEmployee.getId(), task.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(task.getId()))
                .andExpect(jsonPath("$.description").value("Tarefa específica"));
    }

    @Test
    @DisplayName("PUT /employees/{employeeId}/tasks/{taskId} - Deve atualizar tarefa")
    void shouldUpdateEmployeeTask() throws Exception {
        Task task = new Task();
        task.setDescription("Tarefa original");
        task.setStartDate(LocalDate.now());
        task.setExpectedEndDate(LocalDate.now().plusDays(7));
        task.setEmployeeId(testEmployee.getId());
        task = taskRepository.save(task);

        String requestBody = """
            {
                "description": "Tarefa atualizada",
                "startDate": "2024-01-01",
                "expectedEndDate": "2024-01-15"
            }
            """;

        mockMvc.perform(put("/employees/{employeeId}/tasks/{taskId}", 
                        testEmployee.getId(), task.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Tarefa atualizada"));
    }

    @Test
    @DisplayName("DELETE /employees/{employeeId}/tasks/{taskId} - Deve deletar tarefa")
    void shouldDeleteEmployeeTask() throws Exception {
        Task task = new Task();
        task.setDescription("Tarefa para deletar");
        task.setStartDate(LocalDate.now());
        task.setExpectedEndDate(LocalDate.now().plusDays(7));
        task.setEmployeeId(testEmployee.getId());
        task = taskRepository.save(task);

        mockMvc.perform(delete("/employees/{employeeId}/tasks/{taskId}", 
                        testEmployee.getId(), task.getId()))
                .andExpect(status().isNoContent());

        // Verificar que foi deletado
        mockMvc.perform(get("/employees/{employeeId}/tasks/{taskId}", 
                        testEmployee.getId(), task.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /health - Deve retornar status do serviço")
    void shouldReturnHealthStatus() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").exists());
    }
}


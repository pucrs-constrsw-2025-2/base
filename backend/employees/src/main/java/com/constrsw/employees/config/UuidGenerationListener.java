package com.constrsw.employees.config;

import com.constrsw.employees.entity.Employee;
import com.constrsw.employees.entity.Task;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertEvent;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Listener do MongoDB que gera UUIDs automaticamente para entidades
 * Employee e Task antes de salvá-las no banco de dados.
 * 
 * Este listener intercepta o evento BeforeConvert e gera um UUID
 * apenas se o ID ainda não estiver definido, garantindo que novos
 * documentos sempre tenham um UUID, mas documentos existentes
 * mantenham seus IDs originais.
 * 
 * Funciona para ambas as entidades: Employee e Task.
 */
@Component
public class UuidGenerationListener extends AbstractMongoEventListener<Object> {

    @Override
    public void onBeforeConvert(@NonNull BeforeConvertEvent<Object> event) {
        Object source = event.getSource();
        
        if (source instanceof Employee) {
            Employee employee = (Employee) source;
            if (employee.getId() == null || employee.getId().trim().isEmpty()) {
                employee.setId(UUID.randomUUID().toString());
            }
        } else if (source instanceof Task) {
            Task task = (Task) source;
            if (task.getId() == null || task.getId().trim().isEmpty()) {
                task.setId(UUID.randomUUID().toString());
            }
        }
    }
}

/**
 * Listener específico para Task para garantir que UUIDs sejam gerados.
 * Este listener complementa o listener genérico acima.
 */
@Component
class TaskUuidGenerationListener extends AbstractMongoEventListener<Task> {

    @Override
    public void onBeforeConvert(@NonNull BeforeConvertEvent<Task> event) {
        Task task = event.getSource();
        if (task.getId() == null || task.getId().trim().isEmpty()) {
            task.setId(UUID.randomUUID().toString());
        }
    }
}

/**
 * Listener específico para Employee para garantir que UUIDs sejam gerados.
 * Este listener complementa o listener genérico acima.
 */
@Component
class EmployeeUuidGenerationListener extends AbstractMongoEventListener<Employee> {

    @Override
    public void onBeforeConvert(@NonNull BeforeConvertEvent<Employee> event) {
        Employee employee = event.getSource();
        if (employee.getId() == null || employee.getId().trim().isEmpty()) {
            employee.setId(UUID.randomUUID().toString());
        }
    }
}


package com.constrsw.employees.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.Status;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Health check controller padronizado.
 * Expõe o endpoint /api/v1/health (context-path /api/v1 é aplicado automaticamente),
 * retornando formato compatível com Spring Boot Actuator.
 */
@RestController
public class HealthController {
    
    @Autowired(required = false)
    private HealthEndpoint healthEndpoint;
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        
        // Se o Actuator estiver disponível, usa seu status
        if (healthEndpoint != null) {
            var healthComponent = healthEndpoint.health();
            var status = healthComponent.getStatus();
            
            // Converter Status do Actuator para formato padronizado
            String statusString = status.getCode().equals(Status.UP.getCode()) ? "UP" : "DOWN";
            response.put("status", statusString);
            
            // Incluir componentes do Actuator se disponíveis
            // Verificar se é do tipo Health (que tem getDetails)
            if (healthComponent instanceof Health) {
                Health health = (Health) healthComponent;
                if (health.getDetails() != null && !health.getDetails().isEmpty()) {
                    Map<String, Object> components = new HashMap<>();
                    health.getDetails().forEach((key, value) -> {
                        if (value instanceof Map) {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> componentDetails = (Map<String, Object>) value;
                            components.put(key, componentDetails);
                        } else {
                            Map<String, Object> component = new HashMap<>();
                            component.put("status", value);
                            components.put(key, component);
                        }
                    });
                    response.put("components", components);
                }
            }
            
            // Retornar status HTTP apropriado
            if (status == Status.UP) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(503).body(response);
            }
        }
        
        // Fallback caso o Actuator não esteja disponível
        response.put("status", "UP");
        Map<String, Object> components = new HashMap<>();
        Map<String, Object> service = new HashMap<>();
        service.put("status", "UP");
        components.put("service", service);
        response.put("components", components);
        
        return ResponseEntity.ok(response);
    }
}


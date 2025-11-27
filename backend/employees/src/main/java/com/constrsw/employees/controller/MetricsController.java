package com.constrsw.employees.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.endpoint.web.WebEndpointResponse;
import org.springframework.boot.actuate.metrics.export.prometheus.PrometheusOutputFormat;
import org.springframework.boot.actuate.metrics.export.prometheus.PrometheusScrapeEndpoint;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

/**
 * Metrics controller padronizado.
 * Expõe o endpoint /api/v1/metrics (context-path /api/v1 é aplicado automaticamente),
 * retornando métricas no formato Prometheus.
 */
@RestController
public class MetricsController {
    
    @Autowired(required = false)
    private PrometheusScrapeEndpoint prometheusScrapeEndpoint;
    
    @GetMapping("/metrics")
    public ResponseEntity<String> metrics() {
        // Se o Actuator Prometheus endpoint estiver disponível, usa suas métricas
        if (prometheusScrapeEndpoint != null) {
            try {
                WebEndpointResponse<byte[]> response = prometheusScrapeEndpoint.scrape(
                        PrometheusOutputFormat.CONTENT_TYPE_004,
                        Collections.emptySet()
                );
                
                HttpHeaders headers = new HttpHeaders();
                headers.add(HttpHeaders.CONTENT_TYPE, "text/plain; version=0.0.4; charset=utf-8");
                
                String metricsBody = new String(response.getBody(), java.nio.charset.StandardCharsets.UTF_8);
                
                return ResponseEntity
                        .status(response.getStatus())
                        .headers(headers)
                        .body(metricsBody);
            } catch (Exception e) {
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .header(HttpHeaders.CONTENT_TYPE, "text/plain; charset=utf-8")
                        .body("# Error retrieving metrics: " + e.getMessage() + "\n");
            }
        }
        
        // Fallback caso o Actuator não esteja disponível
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .header(HttpHeaders.CONTENT_TYPE, "text/plain; charset=utf-8")
                .body("# Metrics endpoint not available\n");
    }
}


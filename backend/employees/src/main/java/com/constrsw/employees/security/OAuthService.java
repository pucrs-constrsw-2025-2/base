package com.constrsw.employees.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class OAuthService {
    
    private final WebClient webClient;
    
    @Value("${oauth.internal.host:oauth}")
    private String oauthHost;
    
    @Value("${oauth.internal.port:8000}")
    private String oauthPort;
    
    public OAuthService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }
    
    public Mono<OAuthValidationResponse> validateToken(String authHeader) {
        String validationUrl = String.format("http://%s:%s/api/v1/validate", oauthHost, oauthPort);
        
        return webClient.post()
                .uri(validationUrl)
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("{}")
                .retrieve()
                .bodyToMono(OAuthValidationResponse.class)
                .onErrorResume(error -> {
                    return Mono.error(new RuntimeException("Token validation failed: " + error.getMessage()));
                });
    }
}


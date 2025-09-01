package com.grupo6.constrsw.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO para requisição de autenticação")
public class AuthRequest {
    
    @Schema(description = "Nome de usuário", example = "user@example.com", required = true)
    private String username;

    @Schema(description = "Senha do usuário", example = "string", required = true)
    private String password;
    
    public AuthRequest() {}
    
    public AuthRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
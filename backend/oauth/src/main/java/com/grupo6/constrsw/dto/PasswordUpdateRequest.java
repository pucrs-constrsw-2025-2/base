package com.grupo6.constrsw.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO para requisição de atualização de senha")
public class PasswordUpdateRequest {
    
    @Schema(description = "Nova senha do usuário", example = "newPassword123", required = true)
    private String password;
    
    public PasswordUpdateRequest() {}
    
    public PasswordUpdateRequest(String password) {
        this.password = password;
    }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

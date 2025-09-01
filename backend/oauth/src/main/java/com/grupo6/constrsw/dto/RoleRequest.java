package com.grupo6.constrsw.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO para requisição de criação/atualização de role")
public class RoleRequest {
    
    @Schema(description = "Nome da role", example = "admin", required = true)
    private String name;

    @Schema(description = "Descrição da role", example = "Administrador do sistema")
    private String description;
    
    public RoleRequest() {}
    
    public RoleRequest(String name, String description) {
        this.name = name;
        this.description = description;
    }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

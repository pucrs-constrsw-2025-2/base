package com.grupo6.constrsw.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO para resposta de role")
public class RoleResponse {
    
    @Schema(description = "ID da role", example = "f47ac10b-58cc-4372-a567-0e02b2c3d479")
    private String id;

    @Schema(description = "Nome da role", example = "admin")
    private String name;

    @Schema(description = "Descrição da role", example = "Administrador do sistema")
    private String description;

    @Schema(description = "Status da role", example = "true")
    private Boolean enabled;
    
    public RoleResponse() {}
    
    public RoleResponse(String id, String name, String description, Boolean enabled) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.enabled = enabled;
    }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
}

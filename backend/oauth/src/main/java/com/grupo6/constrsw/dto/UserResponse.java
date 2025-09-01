package com.grupo6.constrsw.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO para resposta de usuário")
public class UserResponse {
    
    @Schema(description = "ID do usuário", example = "f47ac10b-58cc-4372-a567-0e02b2c3d479")
    private String id;

    @Schema(description = "Nome de usuário (email)", example = "user@example.com")
    private String username;

    @JsonProperty("firstName")
    @Schema(description = "Primeiro nome do usuário", example = "João")
    private String first_name;

    @JsonProperty("lastName")
    @Schema(description = "Último nome do usuário", example = "Silva")
    private String last_name;

    @Schema(description = "Status do usuário", example = "true")
    private Boolean enabled;
    
    public UserResponse() {}
    
    public UserResponse(String id, String username, String first_name, String last_name, Boolean enabled) {
        this.id         = id;
        this.username   = username;
        this.first_name = first_name;
        this.last_name  = last_name;
        this.enabled    = enabled;
    }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getFirst_name() { return first_name; }
    public void setFirst_name(String first_name) { this.first_name = first_name; }
    
    public String getLast_name() { return last_name; }
    public void setLast_name(String last_name) { this.last_name = last_name; }
    
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
}

package com.grupo6.constrsw.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO para requisição de criação/atualização de usuário")
public class UserRequest {
    
    @Schema(description = "Nome de usuário (email)", example = "user@example.com", required = true)
    private String username;

    @Schema(description = "Senha do usuário", example = "string", required = true)
    private String password;
    
    @JsonProperty("first-name")
    @Schema(description = "Primeiro nome do usuário", example = "João")
    private String first_name;
    
    @JsonProperty("last-name")
    @Schema(description = "Último nome do usuário", example = "Silva")
    private String last_name;
    
    public UserRequest() {}
    
    public UserRequest(String username, String password, String first_name, String last_name) {
        this.username = username;
        this.password = password;
        this.first_name = first_name;
        this.last_name = last_name;
    }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getFirst_name() { return first_name; }
    public void setFirst_name(String first_name) { this.first_name = first_name; }
    
    public String getLast_name() { return last_name; }
    public void setLast_name(String last_name) { this.last_name = last_name; }
}

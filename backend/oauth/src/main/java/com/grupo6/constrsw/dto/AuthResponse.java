package com.grupo6.constrsw.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO para resposta de autenticação")
public class AuthResponse {
    
    @Schema(description = "Tipo do token", example = "Bearer")
    private String token_type;

    @Schema(description = "Token de acesso", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c")
    private String access_token;

    @Schema(description = "Tempo de expiração do token em segundos", example = "3600")
    private Integer expires_in;

    @Schema(description = "Token de atualização", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c")
    private String refresh_token;

    @Schema(description = "Tempo de expiração do token de atualização em segundos", example = "86400")
    private Integer refresh_expires_in;
    
    public AuthResponse() {}
    
    public AuthResponse(String token_type, String access_token, Integer expires_in, String refresh_token, Integer refresh_expires_in) {
        this.token_type = token_type;
        this.access_token = access_token;
        this.expires_in = expires_in;
        this.refresh_token = refresh_token;
        this.refresh_expires_in = refresh_expires_in;
    }
    
    public String getToken_type() { return token_type; }
    public void setToken_type(String token_type) { this.token_type = token_type; }
    
    public String getAccess_token() { return access_token; }
    public void setAccess_token(String access_token) { this.access_token = access_token; }
    
    public Integer getExpires_in() { return expires_in; }
    public void setExpires_in(Integer expires_in) { this.expires_in = expires_in; }
    
    public String getRefresh_token() { return refresh_token; }
    public void setRefresh_token(String refresh_token) { this.refresh_token = refresh_token; }
    
    public Integer getRefresh_expires_in() { return refresh_expires_in; }
    public void setRefresh_expires_in(Integer refresh_expires_in) { this.refresh_expires_in = refresh_expires_in; }
}
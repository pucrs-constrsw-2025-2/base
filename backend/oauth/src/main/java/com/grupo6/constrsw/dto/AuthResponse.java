package com.grupo6.constrsw.dto;

public class AuthResponse {
    
    private String token_type;
    private String access_token;
    private Integer expires_in;
    private String refresh_token;
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
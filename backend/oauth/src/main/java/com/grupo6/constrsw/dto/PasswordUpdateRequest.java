package com.grupo6.constrsw.dto;

public class PasswordUpdateRequest {
    
    private String password;
    
    public PasswordUpdateRequest() {}
    
    public PasswordUpdateRequest(String password) {
        this.password = password;
    }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

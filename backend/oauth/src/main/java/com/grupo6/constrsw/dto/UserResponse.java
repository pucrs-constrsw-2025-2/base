package com.grupo6.constrsw.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserResponse {
    
    private String id;
    private String username;
    @JsonProperty("first-name")
    private String first_name;
    @JsonProperty("last-name")
    private String last_name;
    private Boolean enabled;
    
    public UserResponse() {}
    
    public UserResponse(String id, String username, String first_name, String last_name, Boolean enabled) {
        this.id = id;
        this.username = username;
        this.first_name = first_name;
        this.last_name = last_name;
        this.enabled = enabled;
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

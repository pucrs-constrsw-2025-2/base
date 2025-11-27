package com.constrsw.employees.security;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OAuthValidationResponse {
    private boolean active;
    private String sub;
    private String username;
    @JsonProperty("preferred_username")
    private String preferredUsername;
    private String email;
    @JsonProperty("realm_access")
    private RealmAccess realmAccess;
    @JsonProperty("resource_access")
    private Map<String, RealmAccess> resourceAccess;
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    public String getSub() {
        return sub;
    }
    
    public void setSub(String sub) {
        this.sub = sub;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPreferredUsername() {
        return preferredUsername;
    }
    
    public void setPreferredUsername(String preferredUsername) {
        this.preferredUsername = preferredUsername;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public RealmAccess getRealmAccess() {
        return realmAccess;
    }
    
    public void setRealmAccess(RealmAccess realmAccess) {
        this.realmAccess = realmAccess;
    }
    
    public Map<String, RealmAccess> getResourceAccess() {
        return resourceAccess;
    }
    
    public void setResourceAccess(Map<String, RealmAccess> resourceAccess) {
        this.resourceAccess = resourceAccess;
    }
    
    public List<String> getRoles() {
        ArrayList<String> allRoles = new ArrayList<>();
        
        // Adicionar roles do realm
        if (realmAccess != null && realmAccess.getRoles() != null) {
            allRoles.addAll(realmAccess.getRoles());
        }
        
        // Adicionar roles de recursos (ex: oauth, account, etc.)
        if (resourceAccess != null) {
            resourceAccess.values().forEach(access -> {
                if (access != null && access.getRoles() != null) {
                    allRoles.addAll(access.getRoles());
                }
            });
        }
        
        // Remover duplicatas
        return allRoles.stream().distinct().collect(Collectors.toList());
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RealmAccess {
        private List<String> roles;
        
        public List<String> getRoles() {
            return roles;
        }
        
        public void setRoles(List<String> roles) {
            this.roles = roles;
        }
    }
}


package com.grupo6.constrsw.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.grupo6.constrsw.dto.AuthRequest;
import com.grupo6.constrsw.dto.AuthResponse;
import com.grupo6.constrsw.dto.PasswordUpdateRequest;
import com.grupo6.constrsw.dto.RoleRequest;
import com.grupo6.constrsw.dto.RoleResponse;
import com.grupo6.constrsw.dto.UserRequest;
import com.grupo6.constrsw.dto.UserResponse;

@Service
public class KeycloakService {

    @Value("${keycloak.external.protocol}")
    private String protocol;

    @Value("${keycloak.external.host}")
    private String host;

    @Value("${keycloak.external.api.port}")
    private String port;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.client.id}")
    private String clientId;

    @Value("${keycloak.client.secret}")
    private String clientSecret;

    @Value("${keycloak.grant.type}")
    private String grantType;

    private final RestTemplate restTemplate = new RestTemplate();



    public AuthResponse authenticate(AuthRequest request) {
        String url = String.format("%s://%s:%s/realms/%s/protocol/openid-connect/token",
                protocol, host, port, realm);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("grant_type", grantType);
        params.add("username", request.getUsername());
        params.add("password", request.getPassword());

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<AuthResponse> response = restTemplate.postForEntity(url, entity, AuthResponse.class);
            return response.getBody();
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Erro na autenticação: " + e.getMessage());
        }
    }

    public UserResponse createUser(UserRequest userRequest, String accessToken) {
        String url = String.format("%s://%s:%s/admin/realms/%s/users",
                protocol, host, port, realm);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        Map<String, Object> user = new HashMap<>();
        user.put("username", userRequest.getUsername());
        user.put("email", userRequest.getUsername()); // Keycloak exige o campo email
        user.put("firstName", userRequest.getFirst_name());
        user.put("lastName", userRequest.getLast_name());
        user.put("enabled", true);
        user.put("emailVerified", true);

        Map<String, Object> credentials = new HashMap<>();
        credentials.put("type", "password");
        credentials.put("value", userRequest.getPassword());
        credentials.put("temporary", false);
        user.put("credentials", List.of(credentials));


        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(user, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            String location = response.getHeaders().getFirst("Location");
            if (location == null) {
                throw new RuntimeException("Location header não encontrado na resposta");
            }
            String userId = location.substring(location.lastIndexOf('/') + 1);

            return new UserResponse(userId, userRequest.getUsername(), 
                    userRequest.getFirst_name(), userRequest.getLast_name(), true);
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Erro ao criar usuário: " + e.getMessage());
        }
    }

    public List<UserResponse> getAllUsers(String accessToken, Boolean enabled) {
        String url = String.format("%s://%s:%s/admin/realms/%s/users",
                protocol, host, port, realm);
        
        if (enabled != null) {
            url += "?enabled=" + enabled;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<UserResponse[]> response = restTemplate.exchange(url, HttpMethod.GET, entity, UserResponse[].class);
            return List.of(response.getBody());
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Erro ao buscar usuários: " + e.getMessage());
        }
    }

    public UserResponse getUserById(String userId, String accessToken) {
        String url = String.format("%s://%s:%s/admin/realms/%s/users/%s",
                protocol, host, port, realm, userId);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<UserResponse> response = restTemplate.exchange(url, HttpMethod.GET, entity, UserResponse.class);
            return response.getBody();
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Erro ao buscar usuário: " + e.getMessage());
        }
    }

    public void updateUser(String userId, UserRequest userRequest, String accessToken) {
        String url = String.format("%s://%s:%s/admin/realms/%s/users/%s",
                protocol, host, port, realm, userId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        Map<String, Object> user = new HashMap<>();
        user.put("username", userRequest.getUsername());
        user.put("firstName", userRequest.getFirst_name());
        user.put("lastName", userRequest.getLast_name());
        user.put("email", userRequest.getUsername());
        // Não alterar o campo enabled - manter o valor atual

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(user, headers);

        try {
            restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Erro ao atualizar usuário: " + e.getMessage());
        }
    }

    public void updateUserPassword(String userId, PasswordUpdateRequest passwordRequest, String accessToken) {
        String url = String.format("%s://%s:%s/admin/realms/%s/users/%s/reset-password",
                protocol, host, port, realm, userId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        Map<String, Object> credentials = new HashMap<>();
        credentials.put("type", "password");
        credentials.put("value", passwordRequest.getPassword());
        credentials.put("temporary", false);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(credentials, headers);

        try {
            restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Erro ao atualizar senha: " + e.getMessage());
        }
    }

    public void disableUser(String userId, String accessToken) {
        String url = String.format("%s://%s:%s/admin/realms/%s/users/%s",
                protocol, host, port, realm, userId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        Map<String, Object> user = new HashMap<>();
        user.put("enabled", false);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(user, headers);

        try {
            restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Erro ao desabilitar usuário: " + e.getMessage());
        }
    }

    public void enableUser(String userId, String accessToken) {
        String url = String.format("%s://%s:%s/admin/realms/%s/users/%s",
                protocol, host, port, realm, userId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        Map<String, Object> user = new HashMap<>();
        user.put("enabled", true);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(user, headers);

        try {
            restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Erro ao habilitar usuário: " + e.getMessage());
        }
    }

    // Métodos para Roles
    public RoleResponse createRole(RoleRequest roleRequest, String accessToken) {
        String url = String.format("%s://%s:%s/admin/realms/%s/roles",
                protocol, host, port, realm);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        Map<String, Object> role = new HashMap<>();
        role.put("name", roleRequest.getName());
        role.put("description", roleRequest.getDescription());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(role, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            return new RoleResponse(null, roleRequest.getName(), roleRequest.getDescription(), true);
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Erro ao criar role: " + e.getMessage());
        }
    }

    public List<RoleResponse> getAllRoles(String accessToken) {
        String url = String.format("%s://%s:%s/admin/realms/%s/roles",
                protocol, host, port, realm);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<RoleResponse[]> response = restTemplate.exchange(url, HttpMethod.GET, entity, RoleResponse[].class);
            return List.of(response.getBody());
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Erro ao buscar roles: " + e.getMessage());
        }
    }

    public RoleResponse getRoleByName(String roleName, String accessToken) {
        String url = String.format("%s://%s:%s/admin/realms/%s/roles/%s",
                protocol, host, port, realm, roleName);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<RoleResponse> response = restTemplate.exchange(url, HttpMethod.GET, entity, RoleResponse.class);
            return response.getBody();
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Erro ao buscar role: " + e.getMessage());
        }
    }

    public void updateRole(String roleName, RoleRequest roleRequest, String accessToken) {
        String url = String.format("%s://%s:%s/admin/realms/%s/roles/%s",
                protocol, host, port, realm, roleName);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        Map<String, Object> role = new HashMap<>();
        role.put("name", roleRequest.getName());
        role.put("description", roleRequest.getDescription());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(role, headers);

        try {
            restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Erro ao atualizar role: " + e.getMessage());
        }
    }

    public void deleteRole(String roleName, String accessToken) {
        String url = String.format("%s://%s:%s/admin/realms/%s/roles/%s",
                protocol, host, port, realm, roleName);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Erro ao deletar role: " + e.getMessage());
        }
    }

    public void assignRoleToUser(String userId, String roleName, String accessToken) {
        // Primeiro, buscar o role para obter o ID
        RoleResponse roleResponse = getRoleByName(roleName, accessToken);
        if (roleResponse == null || roleResponse.getId() == null) {
            throw new RuntimeException("Role não encontrado: " + roleName);
        }

        String url = String.format("%s://%s:%s/admin/realms/%s/users/%s/role-mappings/realm",
                protocol, host, port, realm, userId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        Map<String, Object> role = new HashMap<>();
        role.put("id", roleResponse.getId());
        role.put("name", roleName);

        HttpEntity<Map<String, Object>[]> entity = new HttpEntity<>(new Map[]{role}, headers);

        try {
            restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Erro ao atribuir role ao usuário: " + e.getMessage());
        }
    }

    public void removeRoleFromUser(String userId, String roleName, String accessToken) {
        // Primeiro, buscar o role para obter o ID
        RoleResponse roleResponse = getRoleByName(roleName, accessToken);
        if (roleResponse == null || roleResponse.getId() == null) {
            throw new RuntimeException("Role não encontrado: " + roleName);
        }

        String url = String.format("%s://%s:%s/admin/realms/%s/users/%s/role-mappings/realm",
                protocol, host, port, realm, userId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        Map<String, Object> role = new HashMap<>();
        role.put("id", roleResponse.getId());
        role.put("name", roleName);

        HttpEntity<Map<String, Object>[]> entity = new HttpEntity<>(new Map[]{role}, headers);

        try {
            restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Erro ao remover role do usuário: " + e.getMessage());
        }
    }
}

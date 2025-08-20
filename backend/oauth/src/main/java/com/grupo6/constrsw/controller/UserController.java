package com.grupo6.constrsw.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.grupo6.constrsw.dto.ApiError;
import com.grupo6.constrsw.dto.PasswordUpdateRequest;
import com.grupo6.constrsw.dto.UserRequest;
import com.grupo6.constrsw.dto.UserResponse;
import com.grupo6.constrsw.service.KeycloakService;
import com.grupo6.constrsw.service.PermissionService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private KeycloakService keycloakService;

    @Autowired
    private PermissionService permissionService;

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserRequest userRequest, 
                                       @RequestHeader("Authorization") String authorization) {
        try {
            String accessToken = extractToken(authorization);
            
            // Verificar se o usuário tem permissões de admin
            if (!permissionService.canAccessAdminEndpoints(accessToken)) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            if (!isValidEmail(userRequest.getUsername())) {
                ApiError error = new ApiError("OA-400", "E-mail inválido", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            UserResponse response = keycloakService.createUser(userRequest, accessToken);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("401")) {
                ApiError error = new ApiError("OA-401", "Access token inválido", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            } else if (e.getMessage().contains("403")) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            } else if (e.getMessage().contains("409")) {
                ApiError error = new ApiError("OA-409", "Username já existente", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            } else {
                ApiError error = new ApiError("OA-400", "Erro na estrutura da chamada", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String authorization,
                                        @RequestParam(required = false) Boolean enabled) {
        try {
            String accessToken = extractToken(authorization);
            
            // Verificar se o usuário tem permissões de admin
            if (!permissionService.canAccessAdminEndpoints(accessToken)) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            List<UserResponse> users = keycloakService.getAllUsers(accessToken, enabled);
            return ResponseEntity.ok(users);
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("401")) {
                ApiError error = new ApiError("OA-401", "Access token inválido", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            } else if (e.getMessage().contains("403")) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            } else {
                ApiError error = new ApiError("OA-400", "Erro na estrutura do request", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id,
                                        @RequestHeader("Authorization") String authorization) {
        try {
            String accessToken = extractToken(authorization);
            
            // Verificar se o usuário tem permissões de admin
            if (!permissionService.canAccessAdminEndpoints(accessToken)) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            UserResponse user = keycloakService.getUserById(id, accessToken);
            return ResponseEntity.ok(user);
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("401")) {
                ApiError error = new ApiError("OA-401", "Access token inválido", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            } else if (e.getMessage().contains("403")) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            } else if (e.getMessage().contains("404")) {
                ApiError error = new ApiError("OA-404", "Objeto não localizado", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            } else {
                ApiError error = new ApiError("OA-400", "Erro na estrutura da chamada", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id,
                                       @RequestBody UserRequest userRequest,
                                       @RequestHeader("Authorization") String authorization) {
        try {
            String accessToken = extractToken(authorization);
            
            // Verificar se o usuário tem permissões de admin
            if (!permissionService.canAccessAdminEndpoints(accessToken)) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            keycloakService.updateUser(id, userRequest, accessToken);
            return ResponseEntity.ok().build();
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("401")) {
                ApiError error = new ApiError("OA-401", "Access token inválido", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            } else if (e.getMessage().contains("403")) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            } else if (e.getMessage().contains("404")) {
                ApiError error = new ApiError("OA-404", "Objeto não localizado", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            } else {
                ApiError error = new ApiError("OA-400", "Erro na estrutura da chamada", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateUserPassword(@PathVariable String id,
                                               @RequestBody PasswordUpdateRequest passwordRequest,
                                               @RequestHeader("Authorization") String authorization) {
        try {
            String accessToken = extractToken(authorization);
            
            // Verificar se o usuário tem permissões de admin
            if (!permissionService.canAccessAdminEndpoints(accessToken)) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            keycloakService.updateUserPassword(id, passwordRequest, accessToken);
            return ResponseEntity.ok().build();
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("401")) {
                ApiError error = new ApiError("OA-401", "Access token inválido", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            } else if (e.getMessage().contains("403")) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            } else if (e.getMessage().contains("404")) {
                ApiError error = new ApiError("OA-404", "Objeto não localizado", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            } else {
                ApiError error = new ApiError("OA-400", "Erro na estrutura da chamada", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        }
    }

    @PutMapping("/{id}/enable")
    public ResponseEntity<?> enableUser(@PathVariable String id,
                                       @RequestHeader("Authorization") String authorization) {
        try {
            String accessToken = extractToken(authorization);
            
            // Verificar se o usuário tem permissões de admin
            if (!permissionService.canAccessAdminEndpoints(accessToken)) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            keycloakService.enableUser(id, accessToken);
            return ResponseEntity.ok().build();
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("401")) {
                ApiError error = new ApiError("OA-401", "Access token inválido", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            } else if (e.getMessage().contains("403")) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            } else if (e.getMessage().contains("404")) {
                ApiError error = new ApiError("OA-404", "Objeto não localizado", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            } else {
                ApiError error = new ApiError("OA-400", "Erro na estrutura da chamada", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id,
                                       @RequestHeader("Authorization") String authorization) {
        try {
            String accessToken = extractToken(authorization);
            
            // Verificar se o usuário tem permissões de admin
            if (!permissionService.canAccessAdminEndpoints(accessToken)) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            keycloakService.disableUser(id, accessToken);
            return ResponseEntity.noContent().build();
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("401")) {
                ApiError error = new ApiError("OA-401", "Access token inválido", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            } else if (e.getMessage().contains("403")) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            } else if (e.getMessage().contains("404")) {
                ApiError error = new ApiError("OA-404", "Objeto não localizado", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            } else {
                ApiError error = new ApiError("OA-400", "Erro na estrutura da chamada", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        }
    }

    private String extractToken(String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        throw new RuntimeException("Token de autorização inválido");
    }

    private boolean isValidEmail(String email) {
        // RFC 5322 official standard regular expression (simplified version)
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email != null && email.matches(emailRegex);
    }
}

package com.grupo6.constrsw.controller;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grupo6.constrsw.dto.ApiError;
import com.grupo6.constrsw.dto.AuthRequest;
import com.grupo6.constrsw.dto.AuthResponse;
import com.grupo6.constrsw.service.KeycloakService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private KeycloakService keycloakService;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("API está funcionando!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@ModelAttribute AuthRequest request) {
        try {
            if (request.getUsername() == null || request.getUsername().trim().isEmpty() ||
                request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                
                ApiError error = new ApiError("OA-400", "Username e password são obrigatórios", 
                    "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            AuthResponse response = keycloakService.authenticate(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("401") || e.getMessage().contains("Unauthorized")) {
                ApiError error = new ApiError("OA-401", "Username e/ou password inválidos", 
                    "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            } else {
                ApiError error = new ApiError("OA-400", "Erro na estrutura da chamada", 
                    "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        }
    }
}

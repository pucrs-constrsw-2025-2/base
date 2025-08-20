package com.grupo6.constrsw.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Base64;
import java.util.Map;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class PermissionService {

    private static final Logger logger = LoggerFactory.getLogger(PermissionService.class);

    @Autowired
    private KeycloakService keycloakService;

    /**
     * Verifica se o usuário tem o role ADMIN
     */
    public boolean hasAdminRole(String accessToken) {
        try {
            logger.info("=== DEBUG: Verificando role ADMIN ===");
            logger.info("Token recebido: {}", accessToken != null ? (accessToken.length() > 50 ? accessToken.substring(0, 50) + "..." : accessToken) : "NULL");
            
            // Decodificar o token JWT para verificar os roles
            String[] parts = accessToken.split("\\.");
            if (parts.length != 3) {
                logger.error("Token JWT inválido - não tem 3 partes");
                return false;
            }

            // Decodificar o payload (parte 1)
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            logger.info("Payload decodificado: {}", payload);
            
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> claims = objectMapper.readValue(payload, Map.class);

            // Verificar realm do token
            String issuer = (String) claims.get("iss");
            logger.info("Token issuer: {}", issuer);

            // Verificar se é token do master realm (admin do Keycloak)
            if (issuer != null && issuer.contains("/realms/master")) {
                logger.info("Token do master realm - admin do Keycloak");
                return true; // Admin do master realm tem privilégios administrativos
            }
            
            // Verificar se é token do realm constrsw com role ADMIN
            Map<String, Object> realmAccess = (Map<String, Object>) claims.get("realm_access");
            if (realmAccess != null) {
                List<String> roles = (List<String>) realmAccess.get("roles");
                logger.info("Roles encontrados: {}", roles);
                if (roles != null && roles.contains("ADMIN")) {
                    logger.info("Role ADMIN encontrado no realm constrsw!");
                    return true;
                } else {
                    logger.info("Role ADMIN NÃO encontrado no realm constrsw");
                }
            } else {
                logger.error("realm_access não encontrado no token");
            }

            return false;
        } catch (Exception e) {
            logger.error("Erro ao verificar role ADMIN: ", e);
            return false;
        }
    }

    /**
     * Verifica se o usuário tem permissão para acessar endpoints administrativos
     */
    public boolean canAccessAdminEndpoints(String accessToken) {
        logger.info("=== DEBUG: canAccessAdminEndpoints chamado ===");
        boolean result = hasAdminRole(accessToken);
        logger.info("Resultado final: {}", result);
        return result;
    }
}

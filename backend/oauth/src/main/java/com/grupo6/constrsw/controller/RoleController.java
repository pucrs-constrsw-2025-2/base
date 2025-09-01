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
import org.springframework.web.bind.annotation.RestController;

import com.grupo6.constrsw.dto.ApiError;
import com.grupo6.constrsw.dto.RoleRequest;
import com.grupo6.constrsw.dto.RoleResponse;
import com.grupo6.constrsw.service.KeycloakService;
import com.grupo6.constrsw.service.PermissionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/roles")
@Tag(name = "Roles", description = "Endpoints para gerenciamento de roles")
public class RoleController {

    @Autowired
    private KeycloakService keycloakService;

    @Autowired
    private PermissionService permissionService;

    @Operation(summary = "Cria uma nova role")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Role criada com sucesso",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = RoleResponse.class))),
        @ApiResponse(responseCode = "400", description = "Requisição inválida",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "401", description = "Token inválido",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Acesso negado",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class)))
    })
    @PostMapping
    public ResponseEntity<?> createRole(@RequestBody RoleRequest roleRequest,
                                       @RequestHeader("Authorization") String authorization) {
        try {
            String accessToken = extractToken(authorization);
            
            if (!permissionService.canAccessAdminEndpoints(accessToken)) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            RoleResponse response = keycloakService.createRole(roleRequest, accessToken);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("401")) {
                ApiError error = new ApiError("OA-401", "Access token inválido", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            } else if (e.getMessage().contains("403")) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            } else {
                ApiError error = new ApiError("OA-400", "Erro na estrutura da chamada", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        }
    }

    @Operation(summary = "Retorna todas as roles")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Roles retornadas com sucesso",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = RoleResponse.class))),
        @ApiResponse(responseCode = "401", description = "Token inválido",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Acesso negado",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class)))
    })
    @GetMapping
    public ResponseEntity<?> getAllRoles(@RequestHeader("Authorization") String authorization) {
        try {
            String accessToken = extractToken(authorization);
            
            if (!permissionService.canAccessAdminEndpoints(accessToken)) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            List<RoleResponse> roles = keycloakService.getAllRoles(accessToken);
            return ResponseEntity.ok(roles);
            
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

    @Operation(summary = "Retorna uma role pelo ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Role retornada com sucesso",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = RoleResponse.class))),
        @ApiResponse(responseCode = "401", description = "Token inválido",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Acesso negado",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "404", description = "Role não encontrada",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<?> getRoleById(@PathVariable String id,
                                        @RequestHeader("Authorization") String authorization) {
        try {
            String accessToken = extractToken(authorization);
            
            if (!permissionService.canAccessAdminEndpoints(accessToken)) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            RoleResponse role = keycloakService.getRoleByName(id, accessToken);
            return ResponseEntity.ok(role);
            
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

    @Operation(summary = "Atualiza uma role")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Role atualizada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Requisição inválida",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "401", description = "Token inválido",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Acesso negado",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "404", description = "Role não encontrada",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class)))
    })
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRole(@PathVariable String id,
                                       @RequestBody RoleRequest roleRequest,
                                       @RequestHeader("Authorization") String authorization) {
        try {
            String accessToken = extractToken(authorization);
            keycloakService.updateRole(id, roleRequest, accessToken);
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

    @Operation(summary = "Atualiza parcialmente uma role")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Role atualizada com sucesso"),
        @ApiResponse(responseCode = "400", description = "Requisição inválida",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "401", description = "Token inválido",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Acesso negado",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "404", description = "Role não encontrada",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class)))
    })
    @PatchMapping("/{id}")
    public ResponseEntity<?> updateRolePartial(@PathVariable String id,
                                              @RequestBody RoleRequest roleRequest,
                                              @RequestHeader("Authorization") String authorization) {
        try {
            String accessToken = extractToken(authorization);
            keycloakService.updateRole(id, roleRequest, accessToken);
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

    @Operation(summary = "Deleta uma role")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Role deletada com sucesso"),
        @ApiResponse(responseCode = "401", description = "Token inválido",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Acesso negado",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "404", description = "Role não encontrada",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class)))
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRole(@PathVariable String id,
                                       @RequestHeader("Authorization") String authorization) {
        try {
            String accessToken = extractToken(authorization);
            keycloakService.deleteRole(id, accessToken);
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

    @Operation(summary = "Atribui uma role a um usuário")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Role atribuída com sucesso"),
        @ApiResponse(responseCode = "400", description = "Requisição inválida",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "401", description = "Token inválido",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Acesso negado",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "404", description = "Usuário ou role não encontrada",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class)))
    })
    @PostMapping("/assign/{userId}/{roleName}")
    public ResponseEntity<?> assignRoleToUser(@PathVariable String userId,
                                              @PathVariable String roleName,
                                              @RequestHeader("Authorization") String authorization) {
        try {
            String accessToken = extractToken(authorization);
            keycloakService.assignRoleToUser(userId, roleName, accessToken);
            return ResponseEntity.ok().build();
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("401")) {
                ApiError error = new ApiError("OA-401", "Access token inválido", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            } else if (e.getMessage().contains("403")) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            } else if (e.getMessage().contains("404")) {
                ApiError error = new ApiError("OA-404", "Usuário ou role não encontrado", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            } else {
                ApiError error = new ApiError("OA-400", "Erro na estrutura da chamada", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
        }
    }

    @Operation(summary = "Remove uma role de um usuário")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Role removida com sucesso"),
        @ApiResponse(responseCode = "400", description = "Requisição inválida",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "401", description = "Token inválido",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "403", description = "Acesso negado",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class))),
        @ApiResponse(responseCode = "404", description = "Usuário ou role não encontrada",
            content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ApiError.class)))
    })
    @DeleteMapping("/unassign/{userId}/{roleName}")
    public ResponseEntity<?> removeRoleFromUser(@PathVariable String userId,
                                               @PathVariable String roleName,
                                               @RequestHeader("Authorization") String authorization) {
        try {
            String accessToken = extractToken(authorization);
            keycloakService.removeRoleFromUser(userId, roleName, accessToken);
            return ResponseEntity.ok().build();
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("401")) {
                ApiError error = new ApiError("OA-401", "Access token inválido", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            } else if (e.getMessage().contains("403")) {
                ApiError error = new ApiError("OA-403", "Access token não concede permissão", "OAuthAPI", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            } else if (e.getMessage().contains("404")) {
                ApiError error = new ApiError("OA-404", "Usuário ou role não encontrado", "OAuthAPI", new ArrayList<>());
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
}

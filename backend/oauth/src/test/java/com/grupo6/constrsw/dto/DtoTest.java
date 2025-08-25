package com.grupo6.constrsw.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@DisplayName("Testes dos DTOs")
class DtoTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("AuthRequest - Deve criar e serializar corretamente")
    void authRequest_ShouldCreateAndSerialize_Correctly() throws JsonProcessingException {
        // Arrange
        AuthRequest authRequest = new AuthRequest();
        authRequest.setUsername("test@example.com");
        authRequest.setPassword("password123");

        // Act
        String json = objectMapper.writeValueAsString(authRequest);
        AuthRequest deserializedRequest = objectMapper.readValue(json, AuthRequest.class);

        // Assert
        assertNotNull(json);
        assertTrue(json.contains("test@example.com"));
        assertTrue(json.contains("password123"));
        assertEquals("test@example.com", deserializedRequest.getUsername());
        assertEquals("password123", deserializedRequest.getPassword());
    }

    @Test
    @DisplayName("AuthRequest - Construtor com parâmetros deve funcionar")
    void authRequest_ConstructorWithParameters_ShouldWork() {
        // Act
        AuthRequest authRequest = new AuthRequest("user@test.com", "pass123");

        // Assert
        assertEquals("user@test.com", authRequest.getUsername());
        assertEquals("pass123", authRequest.getPassword());
    }

    @Test
    @DisplayName("AuthResponse - Deve criar e serializar corretamente")
    void authResponse_ShouldCreateAndSerialize_Correctly() throws JsonProcessingException {
        // Arrange
        AuthResponse authResponse = new AuthResponse();
        authResponse.setToken_type("Bearer");
        authResponse.setAccess_token("access-token-123");
        authResponse.setExpires_in(300);
        authResponse.setRefresh_token("refresh-token-123");
        authResponse.setRefresh_expires_in(1800);

        // Act
        String json = objectMapper.writeValueAsString(authResponse);
        AuthResponse deserializedResponse = objectMapper.readValue(json, AuthResponse.class);

        // Assert
        assertNotNull(json);
        assertTrue(json.contains("Bearer"));
        assertTrue(json.contains("access-token-123"));
        assertEquals("Bearer", deserializedResponse.getToken_type());
        assertEquals("access-token-123", deserializedResponse.getAccess_token());
        assertEquals(300, deserializedResponse.getExpires_in());
        assertEquals("refresh-token-123", deserializedResponse.getRefresh_token());
        assertEquals(1800, deserializedResponse.getRefresh_expires_in());
    }

    @Test
    @DisplayName("UserRequest - Deve criar e serializar com campos corretos")
    void userRequest_ShouldCreateAndSerialize_WithCorrectFields() throws JsonProcessingException {
        // Arrange
        UserRequest userRequest = new UserRequest();
        userRequest.setUsername("test@example.com");
        userRequest.setPassword("password123");
        userRequest.setFirst_name("João");
        userRequest.setLast_name("Silva");

        // Act
        String json = objectMapper.writeValueAsString(userRequest);
        UserRequest deserializedRequest = objectMapper.readValue(json, UserRequest.class);

        // Assert
        assertNotNull(json);
        assertTrue(json.contains("first-name")); // Deve usar @JsonProperty
        assertTrue(json.contains("last-name"));
        assertTrue(json.contains("João"));
        assertTrue(json.contains("Silva"));
        assertEquals("test@example.com", deserializedRequest.getUsername());
        assertEquals("password123", deserializedRequest.getPassword());
        assertEquals("João", deserializedRequest.getFirst_name());
        assertEquals("Silva", deserializedRequest.getLast_name());
    }

    @Test
    @DisplayName("UserRequest - Construtor com parâmetros deve funcionar")
    void userRequest_ConstructorWithParameters_ShouldWork() {
        // Act
        UserRequest userRequest = new UserRequest("user@test.com", "pass123", "Nome", "Sobrenome");

        // Assert
        assertEquals("user@test.com", userRequest.getUsername());
        assertEquals("pass123", userRequest.getPassword());
        assertEquals("Nome", userRequest.getFirst_name());
        assertEquals("Sobrenome", userRequest.getLast_name());
    }

    @Test
    @DisplayName("UserResponse - Deve criar e serializar corretamente")
    void userResponse_ShouldCreateAndSerialize_Correctly() throws JsonProcessingException {
        // Arrange
        UserResponse userResponse = new UserResponse();
        userResponse.setId("123e4567-e89b-12d3-a456-426614174000");
        userResponse.setUsername("test@example.com");
        userResponse.setFirst_name("João");
        userResponse.setLast_name("Silva");
        userResponse.setEnabled(true);

        // Act
        String json = objectMapper.writeValueAsString(userResponse);
        UserResponse deserializedResponse = objectMapper.readValue(json, UserResponse.class);

        // Assert
        assertNotNull(json);
        assertTrue(json.contains("123e4567-e89b-12d3-a456-426614174000"));
        assertTrue(json.contains("test@example.com"));
        assertTrue(json.contains("João"));
        assertTrue(json.contains("Silva"));
        assertEquals("123e4567-e89b-12d3-a456-426614174000", deserializedResponse.getId());
        assertEquals("test@example.com", deserializedResponse.getUsername());
        assertEquals("João", deserializedResponse.getFirst_name());
        assertEquals("Silva", deserializedResponse.getLast_name());
        assertTrue(deserializedResponse.getEnabled());
    }

    @Test
    @DisplayName("PasswordUpdateRequest - Deve criar e serializar corretamente")
    void passwordUpdateRequest_ShouldCreateAndSerialize_Correctly() throws JsonProcessingException {
        // Arrange
        PasswordUpdateRequest passwordRequest = new PasswordUpdateRequest();
        passwordRequest.setPassword("newPassword123");

        // Act
        String json = objectMapper.writeValueAsString(passwordRequest);
        PasswordUpdateRequest deserializedRequest = objectMapper.readValue(json, PasswordUpdateRequest.class);

        // Assert
        assertNotNull(json);
        assertTrue(json.contains("newPassword123"));
        assertEquals("newPassword123", deserializedRequest.getPassword());
    }

    @Test
    @DisplayName("ApiError - Deve criar e serializar corretamente")
    void apiError_ShouldCreateAndSerialize_Correctly() throws JsonProcessingException {
        // Arrange
        ApiError apiError = new ApiError("OA-400", "Erro de teste", "OAuthAPI", java.util.Arrays.asList("Stack trace line 1", "Stack trace line 2"));

        // Act
        String json = objectMapper.writeValueAsString(apiError);
        ApiError deserializedError = objectMapper.readValue(json, ApiError.class);

        // Assert
        assertNotNull(json);
        assertTrue(json.contains("OA-400"));
        assertTrue(json.contains("Erro de teste"));
        assertTrue(json.contains("OAuthAPI"));
        assertEquals("OA-400", deserializedError.getError_code());
        assertEquals("Erro de teste", deserializedError.getError_description());
        assertEquals("OAuthAPI", deserializedError.getError_source());
        assertNotNull(deserializedError.getError_stack());
        assertFalse(deserializedError.getError_stack().isEmpty());
    }

    @Test
    @DisplayName("JSON Serialization - Campos com hífens devem ser mapeados corretamente")
    void jsonSerialization_HyphenatedFields_ShouldBeMappedCorrectly() throws JsonProcessingException {
        // Test para verificar se @JsonProperty funciona corretamente
        String jsonInput = "{\"username\":\"test@example.com\",\"password\":\"pass123\",\"first-name\":\"João\",\"last-name\":\"Silva\"}";
        
        UserRequest userRequest = objectMapper.readValue(jsonInput, UserRequest.class);
        
        assertEquals("test@example.com", userRequest.getUsername());
        assertEquals("pass123", userRequest.getPassword());
        assertEquals("João", userRequest.getFirst_name());
        assertEquals("Silva", userRequest.getLast_name());
    }

    @Test
    @DisplayName("Error Response Structure - Deve seguir o padrão especificado")
    void errorResponseStructure_ShouldFollowSpecifiedPattern() throws JsonProcessingException {
        // Arrange
        ApiError apiError = new ApiError("OA-401", "Username e/ou password inválidos", "OAuthAPI", java.util.Collections.emptyList());

        // Act
        String json = objectMapper.writeValueAsString(apiError);

        // Assert
        assertTrue(json.contains("error_code"));
        assertTrue(json.contains("error_description"));
        assertTrue(json.contains("error_source"));
        assertTrue(json.contains("error_stack"));
        assertTrue(json.contains("OA-401"));
        assertTrue(json.contains("Username e/ou password inválidos"));
        assertTrue(json.contains("OAuthAPI"));
    }
}

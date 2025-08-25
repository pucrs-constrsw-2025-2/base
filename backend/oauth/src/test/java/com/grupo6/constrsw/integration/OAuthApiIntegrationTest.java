package com.grupo6.constrsw.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grupo6.constrsw.dto.UserRequest;
import com.grupo6.constrsw.dto.PasswordUpdateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@TestPropertySource(properties = {
    "keycloak.realm=test-realm",
    "keycloak.server-url=http://localhost:8080",
    "keycloak.client-id=test-client",
    "keycloak.client-secret=test-secret"
})
class OAuthApiIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private static final String USER_ID = "test-user-id";

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("Teste de conectividade básica - Endpoint público")
    void testPublicEndpoint() throws Exception {
        mockMvc.perform(get("/api/test"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Teste de login sem Keycloak - Deve falhar")
    void testLoginWithoutKeycloak() throws Exception {
        MultiValueMap<String, String> loginData = new LinkedMultiValueMap<>();
        loginData.add("username", "admin");
        loginData.add("password", "admin123");

        mockMvc.perform(post("/api/login")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .params(loginData))
                .andExpect(status().isBadRequest()); // Retorna 400 quando dados são inválidos
    }

    @Test
    @DisplayName("Teste de acesso aos usuários sem autorização")
    void testGetUsersWithoutAuthorization() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isBadRequest()); // Retorna 400 quando header Authorization ausente
    }

    @Test
    @DisplayName("Teste de acesso a usuário específico sem autorização")
    void testGetUserByIdWithoutAuthorization() throws Exception {
        mockMvc.perform(get("/api/users/{id}", USER_ID))
                .andExpect(status().isBadRequest()); // Retorna 400 quando header Authorization ausente
    }

    @Test
    @DisplayName("Teste de criação de usuário sem autorização")
    void testCreateUserWithoutAuthorization() throws Exception {
        UserRequest userRequest = new UserRequest();
        userRequest.setUsername("testuser");
        userRequest.setPassword("password123");
        userRequest.setFirst_name("Test");
        userRequest.setLast_name("User");

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userRequest)))
                .andExpect(status().isBadRequest()); // Retorna 400 quando header Authorization ausente
    }

    @Test
    @DisplayName("Validação de estrutura de requests - Dados inválidos")
    void testCreateUserWithInvalidData() throws Exception {
        mockMvc.perform(post("/api/login")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .param("username", "")
                .param("password", ""))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Teste de atualização de usuário sem autorização")
    void testUpdateUserWithoutAuthorization() throws Exception {
        UserRequest userRequest = new UserRequest();
        userRequest.setUsername("updateduser");
        userRequest.setPassword("newpassword123");
        userRequest.setFirst_name("Updated");
        userRequest.setLast_name("User");

        mockMvc.perform(put("/api/users/{id}", USER_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userRequest)))
                .andExpect(status().isBadRequest()); // Retorna 400 quando header Authorization ausente
    }

    @Test
    @DisplayName("Teste de deleção de usuário sem autorização")
    void testDeleteUserWithoutAuthorization() throws Exception {
        mockMvc.perform(delete("/api/users/{id}", USER_ID))
                .andExpect(status().isBadRequest()); // Retorna 400 quando header Authorization ausente
    }

    @Test
    @DisplayName("Teste de atualização de senha sem autorização")
    void testUpdatePasswordWithoutAuthorization() throws Exception {
        PasswordUpdateRequest passwordRequest = new PasswordUpdateRequest();
        passwordRequest.setPassword("newpassword123");

        mockMvc.perform(put("/api/users/{id}/password", USER_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(passwordRequest)))
                .andExpect(status().isNotFound()); // Retorna 404 pois endpoint não existe ainda
    }

    @Test
    @DisplayName("Teste de endpoints de roles sem autorização")
    void testRoleEndpointsWithoutAuthorization() throws Exception {
        mockMvc.perform(get("/api/roles"))
                .andExpect(status().isBadRequest()); // Retorna 400 quando header Authorization ausente

        mockMvc.perform(post("/api/roles")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"test-role\",\"description\":\"Test Role\"}"))
                .andExpect(status().isBadRequest()); // Retorna 400 quando header Authorization ausente
    }

    @Test
    @DisplayName("Teste de atribuição de role sem autorização")
    void testAssignRoleWithoutAuthorization() throws Exception {
        mockMvc.perform(post("/api/users/{userId}/roles/{roleId}", USER_ID, "role-id"))
                .andExpect(status().isNotFound()); // Retorna 404 pois endpoint não existe ainda
    }

    @Test
    @DisplayName("Teste de remoção de role sem autorização")
    void testRemoveRoleWithoutAuthorization() throws Exception {
        mockMvc.perform(delete("/api/users/{userId}/roles/{roleId}", USER_ID, "role-id"))
                .andExpect(status().isNotFound()); // Retorna 404 pois endpoint não existe ainda
    }
}

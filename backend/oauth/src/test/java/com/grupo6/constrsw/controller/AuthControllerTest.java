package com.grupo6.constrsw.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import com.grupo6.constrsw.dto.AuthRequest;
import com.grupo6.constrsw.dto.AuthResponse;
import com.grupo6.constrsw.service.KeycloakService;

@WebMvcTest(AuthController.class)
@DisplayName("Testes do AuthController")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private KeycloakService keycloakService;

    private AuthResponse mockAuthResponse;

    @BeforeEach
    void setUp() {
        mockAuthResponse = new AuthResponse();
        mockAuthResponse.setAccess_token("mock-access-token");
        mockAuthResponse.setToken_type("Bearer");
        mockAuthResponse.setExpires_in(3600);
        mockAuthResponse.setRefresh_token("mock-refresh-token");
    }

    @Test
    @DisplayName("GET /test - Deve retornar status 200 e mensagem de funcionamento")
    void testEndpoint_ShouldReturn200_WhenCalled() throws Exception {
        mockMvc.perform(get("/api/test"))
                .andExpect(status().isOk())
                .andExpect(content().string("API está funcionando!"));
    }

    @Test
    @DisplayName("POST /login - Deve retornar status 201 com token quando credenciais válidas")
    void login_ShouldReturn201WithToken_WhenValidCredentials() throws Exception {
        when(keycloakService.authenticate(any(AuthRequest.class)))
                .thenReturn(mockAuthResponse);

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("username", "testuser");
        formData.add("password", "testpass");

        mockMvc.perform(post("/api/login")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .params(formData))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.access_token").value("mock-access-token"))
                .andExpect(jsonPath("$.token_type").value("Bearer"));
    }
}

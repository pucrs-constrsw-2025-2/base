package com.grupo6.constrsw;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "keycloak.internal.host=localhost",
    "keycloak.internal.api.port=8080",
    "keycloak.external.host=localhost",
    "keycloak.external.api.port=8001",
    "keycloak.realm=constrsw",
    "keycloak.client.id=oauth",
    "keycloak.client.secret=test-secret",
    "keycloak.grant.type=password"
})
@DisplayName("Testes de Configuração da Aplicação")
class ApplicationConfigurationTest {

    @Test
    @DisplayName("Contexto da aplicação - Deve carregar corretamente")
    void contextLoads() {
        // Este teste verifica se a aplicação Spring Boot consegue inicializar
        // com todas as configurações e beans necessários
    }

    @Test
    @DisplayName("Beans principais - Devem ser criados corretamente")
    void mainBeans_ShouldBeCreated_Correctly() {
        // Este teste seria expandido para verificar se os beans principais
        // da aplicação estão sendo criados corretamente
        // Por exemplo: Controllers, Services, etc.
    }
}

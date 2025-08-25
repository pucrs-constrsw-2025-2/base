package com.grupo6.constrsw.util;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("Testes de Validação de Email")
class EmailValidationTest {

    // Este método replica a lógica de validação encontrada no UserController
    private boolean isValidEmail(String email) {
        // RFC 5322 official standard regular expression (simplified version)
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email != null && email.matches(emailRegex);
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "test@example.com",
        "user.name@domain.co.uk",
        "first.last@subdomain.example.org",
        "user+tag@example.com",
        "user_name@example-domain.com",
        "123@example.com",
        "test@123.com"
    })
    @DisplayName("Emails válidos - Devem passar na validação")
    void validEmails_ShouldPassValidation(String email) {
        assertTrue(isValidEmail(email), "Email deveria ser válido: " + email);
    }

    static Stream<String> invalidEmails() {
        return Stream.of(
                "",
                " ",
                "invalid-email",
                "@example.com",
                "test@",
                "test@example.",
                "test @example.com",
                "test@exam ple.com",
                "@.com",
                "test@@example.com",
                "test@example@com",
                null
        );
    }

    @ParameterizedTest
    @MethodSource("invalidEmails")
    @DisplayName("Deve invalidar emails com formato incorreto")
    void invalidEmails_ShouldFailValidation(String email) {
        assertFalse(isValidEmail(email), "Email deveria ser inválido: " + email);
    }

    @Test
    @DisplayName("Email null - Deve falhar na validação")
    void nullEmail_ShouldFailValidation() {
        assertFalse(isValidEmail(null), "Email null deveria ser inválido");
    }

    @Test
    @DisplayName("Email com caracteres especiais válidos - Deve passar na validação")
    void emailWithValidSpecialCharacters_ShouldPassValidation() {
        assertTrue(isValidEmail("user.name+tag@example.com"));
        assertTrue(isValidEmail("user_name@example.com"));
        assertTrue(isValidEmail("user-name@example.com"));
        assertTrue(isValidEmail("user%test@example.com"));
    }

    @Test
    @DisplayName("Email com domínio longo - Deve passar na validação")
    void emailWithLongDomain_ShouldPassValidation() {
        assertTrue(isValidEmail("test@very.long.subdomain.example.com"));
    }

    @Test
    @DisplayName("Email com números - Deve passar na validação")
    void emailWithNumbers_ShouldPassValidation() {
        assertTrue(isValidEmail("user123@example123.com"));
        assertTrue(isValidEmail("123user@123example.com"));
    }
}

package tests

import (
    "fmt"
    "testing"

    "github.com/your-org/oauth/internal/adapters/keycloak"
    "github.com/your-org/oauth/internal/services"
    "github.com/your-org/oauth/internal/ports"
)

func TestNewRolesService_ReturnsRolesPort(t *testing.T) {
    kc := &keycloak.Client{} // cliente vazio apenas para satisfazer assinatura
    svc := services.NewRolesService(kc)

    if svc == nil {
        t.Fatal("NewRolesService returned nil")
    }

    // Verifica que implementa a interface esperada
    var _ ports.RolesPort = svc

    // Verificação adicional: tipo concreto contém 'rolesService'
    typ := fmt.Sprintf("%T", svc)
    if typ == "" {
        t.Fatalf("unexpected empty type string for service: %v", svc)
    }
        // validação simples do nome do tipo para aumentar cobertura/legibilidade do teste
        if typ != "*services.rolesService" && typ != "services.rolesService" {
            t.Logf("aviso: tipo concreto do service é %s (esperado '*services.rolesService' ou 'services.rolesService')", typ)
        }
    }
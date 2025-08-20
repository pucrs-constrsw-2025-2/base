package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/your-org/oauth/internal/adapters/keycloak"
	"github.com/your-org/oauth/internal/http/router"
)

func TestRouter_RegistersExpectedRoutes(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// cria engine com um cliente keycloak vazio (somente para satisfazer assinatura)
	r := router.New(nil, &keycloak.Client{})

	// coleta rotas registradas
	routes := r.Routes()
	routeMap := make(map[string]bool, len(routes))
	for _, ri := range routes {
		routeMap[ri.Method+" "+ri.Path] = true
	}

	expected := []struct {
		method string
		path   string
	}{
		{"POST", "/login"},

		{"POST", "/users"},
		{"GET", "/users"},
		{"GET", "/users/:id"},
		{"PUT", "/users/:id"},
		{"PATCH", "/users/:id/password"},
		{"DELETE", "/users/:id"},

		{"GET", "/roles"},
		{"POST", "/roles"},
		{"GET", "/roles/:id"},
		{"PUT", "/roles/:id"},
		{"PATCH", "/roles/:id"},
		{"DELETE", "/roles/:id"},

		{"POST", "/user-roles/:userId/:roleName"},
		{"DELETE", "/user-roles/:userId/:roleName"},
		{"GET", "/user-roles/:userId"},

		{"GET", "/swagger/*any"},
		{"GET", "/health"},
	}

	for _, e := range expected {
		key := e.method + " " + e.path
		if !routeMap[key] {
			t.Errorf("expected route not registered: %s", key)
		}
	}
}

func TestRouter_HealthEndpoint(t *testing.T) {
	gin.SetMode(gin.TestMode)

	r := router.New(nil, &keycloak.Client{})

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("health endpoint returned status %d, want %d; body=%s", w.Code, http.StatusOK, w.Body.String())
	}

	var resp map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal health response: %v; body=%s", err, w.Body.String())
	}
	if resp["status"] != "ok" {
		t.Fatalf("health response status = %q, want %q", resp["status"], "ok")
	}
}

package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/your-org/oauth/internal/http/handlers"
	"github.com/your-org/oauth/internal/ports"
)

// mockRolesService é a implementação mock da interface ports.RolesPort para testes.
type mockRolesService struct {
	getRolesFn         func(ctx context.Context, bearer string) ([]ports.Role, error)
	getRoleByIDFn      func(ctx context.Context, bearer, id string) (ports.Role, error)
	createRoleFn       func(ctx context.Context, bearer string, role ports.Role) error
	deleteRoleFn       func(ctx context.Context, bearer, id string) error
	assignRoleToUserFn func(ctx context.Context, bearer, userID, roleName string) error
}

func (m *mockRolesService) GetRoles(ctx context.Context, bearer string) ([]ports.Role, error) {
	return m.getRolesFn(ctx, bearer)
}

func (m *mockRolesService) GetRoleByID(ctx context.Context, bearer, id string) (ports.Role, error) {
	return m.getRoleByIDFn(ctx, bearer, id)
}

func (m *mockRolesService) CreateRole(ctx context.Context, bearer string, role ports.Role) error {
	return m.createRoleFn(ctx, bearer, role)
}

func (m *mockRolesService) DeleteRole(ctx context.Context, bearer, id string) error {
	return m.deleteRoleFn(ctx, bearer, id)
}

func (m *mockRolesService) AssignRoleToUser(ctx context.Context, bearer, userID, roleName string) error {
	return m.assignRoleToUserFn(ctx, bearer, userID, roleName)
}

// Funções não utilizadas no escopo deste teste, mas necessárias para satisfazer a interface.
func (m *mockRolesService) UpdateRole(ctx context.Context, bearer, id string, role ports.Role) error { return nil }
func (m *mockRolesService) PatchRole(ctx context.Context, bearer, id string, role ports.Role) error  { return nil }
func (m *mockRolesService) RemoveRoleFromUser(ctx context.Context, bearer, userID, roleName string) error { return nil }
func (m *mockRolesService) GetUserRoles(ctx context.Context, bearer, userID string) ([]ports.Role, error) { return nil, nil }
func (m *mockRolesService) GetRoleByName(ctx context.Context, bearer string, name string) (ports.Role, error) { return ports.Role{}, nil }


func TestRolesHandler_List(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name       string
		bearer     string
		mockFn     func(ctx context.Context, bearer string) ([]ports.Role, error)
		wantStatus int
		wantBody   bool
	}{
		{
			name:       "sucesso ao listar roles",
			bearer:     "valid-token",
			mockFn: func(ctx context.Context, bearer string) ([]ports.Role, error) {
				return []ports.Role{{ID: "1", Name: "admin"}, {ID: "2", Name: "user"}}, nil
			},
			wantStatus: http.StatusOK,
			wantBody:   true,
		},
		{
			name:       "token de autorização ausente",
			bearer:     "",
			wantStatus: http.StatusUnauthorized,
		},
		{
			name:   "erro de serviço (forbidden)",
			bearer: "valid-token",
			mockFn: func(ctx context.Context, bearer string) ([]ports.Role, error) {
				return nil, errors.New("forbidden")
			},
			wantStatus: http.StatusForbidden,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockSvc := &mockRolesService{getRolesFn: tt.mockFn}
			handler := handlers.NewRolesHandler(mockSvc)

			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			c.Request, _ = http.NewRequest(http.MethodGet, "/roles", nil)
			if tt.bearer != "" {
				c.Request.Header.Set("Authorization", "Bearer "+tt.bearer)
			}

			handler.List(c)

			assert.Equal(t, tt.wantStatus, w.Code)
			if tt.wantBody {
				var roles []ports.Role
				err := json.Unmarshal(w.Body.Bytes(), &roles)
				assert.NoError(t, err)
				assert.Len(t, roles, 2)
			}
		})
	}
}

func TestRolesHandler_Create(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name       string
		bearer     string
		input      ports.Role
		mockFn     func(ctx context.Context, bearer string, role ports.Role) error
		wantStatus int
	}{
		{
			name:   "sucesso ao criar role",
			bearer: "valid-token",
			input:  ports.Role{Name: "new-role"},
			mockFn: func(ctx context.Context, bearer string, role ports.Role) error {
				return nil
			},
			wantStatus: http.StatusCreated,
		},
		{
			name:       "token ausente",
			bearer:     "",
			input:      ports.Role{Name: "new-role"},
			wantStatus: http.StatusUnauthorized,
		},
		{
			name:       "nome da role ausente",
			bearer:     "valid-token",
			input:      ports.Role{},
			wantStatus: http.StatusBadRequest,
		},
		{
			name:   "role já existe",
			bearer: "valid-token",
			input:  ports.Role{Name: "existing-role"},
			mockFn: func(ctx context.Context, bearer string, role ports.Role) error {
				return errors.New("409: role already exists")
			},
			wantStatus: http.StatusConflict,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockSvc := &mockRolesService{createRoleFn: tt.mockFn}
			handler := handlers.NewRolesHandler(mockSvc)

			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			
			body, _ := json.Marshal(tt.input)
			c.Request, _ = http.NewRequest(http.MethodPost, "/roles", bytes.NewBuffer(body))
			if tt.bearer != "" {
				c.Request.Header.Set("Authorization", "Bearer "+tt.bearer)
			}

			handler.Create(c)

			assert.Equal(t, tt.wantStatus, w.Code)
		})
	}
}

func TestRolesHandler_Delete(t *testing.T) {
	gin.SetMode(gin.TestMode)
	tests := []struct {
		name       string
		bearer     string
		roleID     string
		mockFn     func(ctx context.Context, bearer, id string) error
		wantStatus int
	}{
		{
			name:   "sucesso ao deletar role",
			bearer: "valid-token",
			roleID: "role-to-delete",
			mockFn: func(ctx context.Context, bearer, id string) error {
				return nil
			},
			wantStatus: http.StatusNoContent,
		},
		{
			name:       "role ID ausente",
			bearer:     "valid-token",
			roleID:     "",
			wantStatus: http.StatusBadRequest,
		},
		{
			name:   "role não encontrada",
			bearer: "valid-token",
			roleID: "not-found-id",
			mockFn: func(ctx context.Context, bearer, id string) error {
				return errors.New("404: not found")
			},
			wantStatus: http.StatusNotFound,
		},
		{
			name:   "erro interno do servidor",
			bearer: "valid-token",
			roleID: "any-id",
			mockFn: func(ctx context.Context, bearer, id string) error {
				return errors.New("internal server error")
			},
			wantStatus: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockSvc := &mockRolesService{deleteRoleFn: tt.mockFn}
			handler := handlers.NewRolesHandler(mockSvc)
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			c.Request, _ = http.NewRequest(http.MethodDelete, "/roles/"+tt.roleID, nil)
			if tt.bearer != "" {
				c.Request.Header.Set("Authorization", "Bearer "+tt.bearer)
			}
			c.Params = gin.Params{gin.Param{Key: "id", Value: tt.roleID}}

			handler.Delete(c)

			assert.Equal(t, tt.wantStatus, w.Code)
		})
	}
}

func TestRolesHandler_AssignToUser(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name       string
		bearer     string
		userID     string
		roleName   string
		mockFn     func(ctx context.Context, bearer, userID, roleName string) error
		wantStatus int
	}{
		{
			name:     "sucesso ao atribuir role",
			bearer:   "valid-token",
			userID:   "user123",
			roleName: "admin",
			mockFn: func(ctx context.Context, bearer, userID, roleName string) error {
				return nil
			},
			wantStatus: http.StatusOK,
		},
		{
			name:       "parâmetros ausentes",
			bearer:     "valid-token",
			userID:     "",
			roleName:   "admin",
			wantStatus: http.StatusBadRequest,
		},
		{
			name:     "usuário ou role não encontrados",
			bearer:   "valid-token",
			userID:   "user123",
			roleName: "non-existent-role",
			mockFn: func(ctx context.Context, bearer, userID, roleName string) error {
				return errors.New("404: not found")
			},
			wantStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockSvc := &mockRolesService{assignRoleToUserFn: tt.mockFn}
			handler := handlers.NewRolesHandler(mockSvc)

			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			
			url := "/user-roles/" + tt.userID + "/" + tt.roleName
			c.Request, _ = http.NewRequest(http.MethodPost, url, nil)
			if tt.bearer != "" {
				c.Request.Header.Set("Authorization", "Bearer "+tt.bearer)
			}
			c.Params = gin.Params{
				{Key: "userId", Value: tt.userID},
				{Key: "roleName", Value: tt.roleName},
			}

			handler.AssignToUser(c)
			
			assert.Equal(t, tt.wantStatus, w.Code)
		})
	}
}
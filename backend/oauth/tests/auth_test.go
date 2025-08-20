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
	"github.com/your-org/oauth/internal/http/handlers"
	"github.com/your-org/oauth/internal/ports"
)

// mock reduzido: implementa apenas a interface usada pelo handler (PasswordLogin)
type mockAuthService struct {
	passwordLoginFn func(ctx context.Context, username, password string) (ports.TokenResponse, error)
}

func (m *mockAuthService) PasswordLogin(ctx context.Context, username, password string) (ports.TokenResponse, error) {
	if m.passwordLoginFn != nil {
		return m.passwordLoginFn(ctx, username, password)
	}
	return ports.TokenResponse{}, nil
}

func TestNewAuthHandler(t *testing.T) {
	mockSvc := &mockAuthService{}
	handler := handlers.NewAuthHandler(mockSvc)
	if handler == nil {
		t.Error("NewAuthHandler returned nil")
	}
}

func TestAuthHandler_Login(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name       string
		username   string
		password   string
		mockFn     func(ctx context.Context, username, password string) (ports.TokenResponse, error)
		wantStatus int
	}{
		{
			name:     "success returns 201 created",
			username: "testuser",
			password: "testpass",
			mockFn: func(ctx context.Context, username, password string) (ports.TokenResponse, error) {
				return ports.TokenResponse{
					AccessToken:  "access_token_123",
					RefreshToken: "refresh_token_123",
					TokenType:    "Bearer",
					ExpiresIn:    3600,
				}, nil
			},
			wantStatus: http.StatusCreated,
		},
		{
			name:     "invalid credentials -> 401",
			username: "invalid",
			password: "invalid",
			mockFn: func(ctx context.Context, username, password string) (ports.TokenResponse, error) {
				return ports.TokenResponse{}, errors.New("invalid credentials")
			},
			wantStatus: http.StatusUnauthorized,
		},
		{
			name:       "missing username -> 400",
			username:   "",
			password:   "testpass",
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "missing password -> 400",
			username:   "testuser",
			password:   "",
			wantStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockSvc := &mockAuthService{passwordLoginFn: tt.mockFn}
			handler := handlers.NewAuthHandler(mockSvc)

			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)

			body := bytes.NewBufferString("username=" + tt.username + "&password=" + tt.password)
			c.Request = httptest.NewRequest(http.MethodPost, "/auth/login", body)
			c.Request.Header.Set("Content-Type", "application/x-www-form-urlencoded")

			handler.Login(c)

			if w.Code != tt.wantStatus {
				t.Fatalf("Login() status = %v, want %v; body=%s", w.Code, tt.wantStatus, w.Body.String())
			}

			if tt.wantStatus == http.StatusCreated {
				var resp ports.TokenResponse
				if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
					t.Fatalf("failed to unmarshal success response: %v", err)
				}
				if resp.AccessToken == "" {
					t.Error("Login() response missing access_token")
				}
			}
		})
	}
}

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

// Mock implementation of UsersPort for testing
type mockUsersService struct {
	createUserFn     func(ctx context.Context, bearer string, u ports.User) (ports.User, error)
	getUsersFn       func(ctx context.Context, bearer string, enabled *bool) ([]ports.User, error)
	getUserByIDFn    func(ctx context.Context, bearer, id string) (ports.User, error)
	updateUserFn     func(ctx context.Context, bearer, id string, u ports.User) error
	updatePasswordFn func(ctx context.Context, bearer, id, newPassword string) error
	disableUserFn    func(ctx context.Context, bearer, id string) error
}

func (m *mockUsersService) CreateUser(ctx context.Context, bearer string, u ports.User) (ports.User, error) {
	return m.createUserFn(ctx, bearer, u)
}

func (m *mockUsersService) GetUsers(ctx context.Context, bearer string, enabled *bool) ([]ports.User, error) {
	return m.getUsersFn(ctx, bearer, enabled)
}

func (m *mockUsersService) GetUserByID(ctx context.Context, bearer, id string) (ports.User, error) {
	return m.getUserByIDFn(ctx, bearer, id)
}

func (m *mockUsersService) UpdateUser(ctx context.Context, bearer, id string, u ports.User) error {
	return m.updateUserFn(ctx, bearer, id, u)
}

func (m *mockUsersService) UpdatePassword(ctx context.Context, bearer, id, newPassword string) error {
	return m.updatePasswordFn(ctx, bearer, id, newPassword)
}

func (m *mockUsersService) DisableUser(ctx context.Context, bearer, id string) error {
	return m.disableUserFn(ctx, bearer, id)
}

func TestNewUsersHandler(t *testing.T) {
	mockSvc := &mockUsersService{}
	handler := handlers.NewUsersHandler(mockSvc)

	// Check if the handler was created successfully
	if handler == nil {
		t.Error("NewUsersHandler returned nil")
	}
}

func TestUsersHandler_Create(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name       string
		bearer     string
		input      ports.User
		mockFn     func(ctx context.Context, bearer string, u ports.User) (ports.User, error)
		wantStatus int
	}{
		{
			name:       "missing bearer token",
			bearer:     "",
			wantStatus: http.StatusUnauthorized,
		},
		{
			name:   "success",
			bearer: "valid-token",
			input: ports.User{
				Username: "testuser",
				Password: "testpass",
			},
			mockFn: func(ctx context.Context, bearer string, u ports.User) (ports.User, error) {
				return ports.User{ID: "123", Username: "testuser"}, nil
			},
			wantStatus: http.StatusCreated,
		},
		{
			name:   "conflict error",
			bearer: "valid-token",
			input: ports.User{
				Username: "existing",
				Password: "testpass",
			},
			mockFn: func(ctx context.Context, bearer string, u ports.User) (ports.User, error) {
				return ports.User{}, errors.New("409: conflict")
			},
			wantStatus: http.StatusConflict,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockSvc := &mockUsersService{
				createUserFn: tt.mockFn,
			}
			handler := handlers.NewUsersHandler(mockSvc)

			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)

			// Set up request
			body, _ := json.Marshal(tt.input)
			c.Request = httptest.NewRequest(http.MethodPost, "/users", bytes.NewBuffer(body))
			if tt.bearer != "" {
				c.Request.Header.Set("Authorization", "Bearer "+tt.bearer)
			}

			handler.Create(c)

			if w.Code != tt.wantStatus {
				t.Errorf("Create() status = %v, want %v", w.Code, tt.wantStatus)
			}
		})
	}
}

func TestUsersHandler_Get(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name       string
		bearer     string
		userID     string
		mockFn     func(ctx context.Context, bearer, id string) (ports.User, error)
		wantStatus int
	}{
		{
			name:       "missing bearer token",
			bearer:     "",
			userID:     "123",
			wantStatus: http.StatusUnauthorized,
		},
		{
			name:       "missing user id",
			bearer:     "valid-token",
			userID:     "",
			wantStatus: http.StatusBadRequest,
		},
		{
			name:   "success",
			bearer: "valid-token",
			userID: "123",
			mockFn: func(ctx context.Context, bearer, id string) (ports.User, error) {
				return ports.User{ID: "123", Username: "testuser"}, nil
			},
			wantStatus: http.StatusOK,
		},
		{
			name:   "user not found",
			bearer: "valid-token",
			userID: "456",
			mockFn: func(ctx context.Context, bearer, id string) (ports.User, error) {
				return ports.User{}, errors.New("404: not found")
			},
			wantStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockSvc := &mockUsersService{
				getUserByIDFn: tt.mockFn,
			}
			handler := handlers.NewUsersHandler(mockSvc)

			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)

			c.Request = httptest.NewRequest(http.MethodGet, "/users/"+tt.userID, nil)
			if tt.bearer != "" {
				c.Request.Header.Set("Authorization", "Bearer "+tt.bearer)
			}
			c.Params = []gin.Param{{Key: "id", Value: tt.userID}}

			handler.Get(c)

			if w.Code != tt.wantStatus {
				t.Errorf("Get() status = %v, want %v", w.Code, tt.wantStatus)
			}
		})
	}
}

func TestUsersHandler_Delete(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name       string
		bearer     string
		userID     string
		mockFn     func(ctx context.Context, bearer, id string) error
		wantStatus int
	}{
		{
			name:       "missing bearer token",
			bearer:     "",
			userID:     "123",
			wantStatus: http.StatusUnauthorized,
		},
		{
			name:       "missing user id",
			bearer:     "valid-token",
			userID:     "",
			wantStatus: http.StatusBadRequest,
		},
		{
			name:   "success",
			bearer: "valid-token",
			userID: "123",
			mockFn: func(ctx context.Context, bearer, id string) error {
				return nil // Simulate successful deletion
			},
			wantStatus: http.StatusNoContent,
		},
		{
			name:   "user not found",
			bearer: "valid-token",
			userID: "456",
			mockFn: func(ctx context.Context, bearer, id string) error {
				return errors.New("404: not found") // Simulate user not found
			},
			wantStatus: http.StatusNotFound,
		},
		{
			name:   "internal server error",
			bearer: "valid-token",
			userID: "123",
			mockFn: func(ctx context.Context, bearer, id string) error {
				return errors.New("500: delete failed") // Simulate internal server error
			},
			wantStatus: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Mock service
			mockSvc := &mockUsersService{
				disableUserFn: tt.mockFn,
			}

			// Handler
			handler := handlers.NewUsersHandler(mockSvc)

			// Recorder and context setup for the test
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)

			// Prepare the request
			c.Request = httptest.NewRequest(http.MethodDelete, "/users/"+tt.userID, nil)
			if tt.bearer != "" {
				c.Request.Header.Set("Authorization", "Bearer "+tt.bearer)
			}
			c.Params = []gin.Param{{Key: "id", Value: tt.userID}}

			// Execute handler
			handler.Delete(c)

			// Assert status code
			if w.Code != tt.wantStatus {
				t.Errorf("Delete() status = %v, want %v", w.Code, tt.wantStatus)
			}

			// Ensure no body is returned for 204 No Content
			if tt.wantStatus == http.StatusNoContent && w.Body.Len() > 0 {
				t.Error("Delete() should not return a body for 204 No Content")
			}
		})
	}
}

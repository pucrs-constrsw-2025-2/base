package ports

import "context"

type Role struct {
	ID          string `json:"id,omitempty"`
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	Composite   bool   `json:"composite"`
}

type RolesPort interface {
	GetRoles(ctx context.Context, bearer string) ([]Role, error)
	GetRoleByName(ctx context.Context, bearer, name string) (Role, error)
	CreateRole(ctx context.Context, bearer string, role Role) error
	UpdateRole(ctx context.Context, bearer, name string, role Role) error
	DeleteRole(ctx context.Context, bearer, name string) error
	AssignRoleToUser(ctx context.Context, bearer, userID, roleName string) error
	RemoveRoleFromUser(ctx context.Context, bearer, userID, roleName string) error
	GetUserRoles(ctx context.Context, bearer, userID string) ([]Role, error)
}

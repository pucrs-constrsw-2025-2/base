package ports

import "context"

type User struct {
	ID        string `json:"id,omitempty"`
	Username  string `json:"username"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Enabled   bool   `json:"enabled"`
	Password  string `json:"password,omitempty"`
}

type UsersPort interface {
	CreateUser(ctx context.Context, bearer string, u User) (User, error)
	GetUsers(ctx context.Context, bearer string, enabled *bool) ([]User, error)
	GetUserByID(ctx context.Context, bearer, id string) (User, error)
	UpdateUser(ctx context.Context, bearer, id string, u User) error
	UpdatePassword(ctx context.Context, bearer, id, newPassword string) error
	DisableUser(ctx context.Context, bearer, id string) error // exclusão lógica
}

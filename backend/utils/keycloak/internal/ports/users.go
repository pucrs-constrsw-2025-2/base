package ports

type User struct {
	ID        string `json:"id,omitempty"`
	Username  string `json:"username"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Enabled   bool   `json:"enabled"`
	Password  string `json:"password,omitempty"`
}

type UsersPort interface {
	CreateUser(bearer string, u User) (User, error)
	GetUsers(bearer string, enabled *bool) ([]User, error)
	GetUserByID(bearer, id string) (User, error)
	UpdateUser(bearer, id string, u User) error
	UpdatePassword(bearer, id, newPassword string) error
	DisableUser(bearer, id string) error // exclusão lógica
}
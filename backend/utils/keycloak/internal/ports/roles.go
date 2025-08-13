package ports

type Role struct {
	ID          string `json:"id,omitempty"`
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	Composite   bool   `json:"composite"`
}

type RolesPort interface {
	GetRoles(bearer string) ([]Role, error)
	GetRoleByName(bearer, name string) (Role, error)
	CreateRole(bearer string, role Role) error
	UpdateRole(bearer, name string, role Role) error
	DeleteRole(bearer, name string) error
	AssignRoleToUser(bearer, userID, roleName string) error
	RemoveRoleFromUser(bearer, userID, roleName string) error
	GetUserRoles(bearer, userID string) ([]Role, error)
}

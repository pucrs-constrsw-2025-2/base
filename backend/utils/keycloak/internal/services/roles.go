package services

import (
	"context"

	"github.com/your-org/oauth/internal/adapters/keycloak"
	"github.com/your-org/oauth/internal/ports"
)

type rolesService struct{ kc *keycloak.Client }

func NewRolesService(kc *keycloak.Client) ports.RolesPort { return &rolesService{kc: kc} }

func (s *rolesService) GetRoles(bearer string) ([]ports.Role, error) {
	roles, err := s.kc.GetRoles(context.Background(), bearer)
	if err != nil {
		return nil, err
	}

	out := make([]ports.Role, 0, len(roles))
	for _, r := range roles {
		out = append(out, ports.Role{
			ID:          r.ID,
			Name:        r.Name,
			Description: r.Description,
			Composite:   r.Composite,
		})
	}
	return out, nil
}

func (s *rolesService) GetRoleByName(bearer, name string) (ports.Role, error) {
	role, err := s.kc.GetRoleByName(context.Background(), bearer, name)
	if err != nil {
		return ports.Role{}, err
	}

	return ports.Role{
		ID:          role.ID,
		Name:        role.Name,
		Description: role.Description,
		Composite:   role.Composite,
	}, nil
}

func (s *rolesService) CreateRole(bearer string, role ports.Role) error {
	kcRole := keycloak.KcRole{
		Name:        role.Name,
		Description: role.Description,
		Composite:   role.Composite,
	}
	return s.kc.CreateRole(context.Background(), bearer, kcRole)
}

func (s *rolesService) UpdateRole(bearer, name string, role ports.Role) error {
	kcRole := keycloak.KcRole{
		Name:        role.Name,
		Description: role.Description,
		Composite:   role.Composite,
	}
	return s.kc.UpdateRole(context.Background(), bearer, name, kcRole)
}

func (s *rolesService) DeleteRole(bearer, name string) error {
	return s.kc.DeleteRole(context.Background(), bearer, name)
}

func (s *rolesService) AssignRoleToUser(bearer, userID, roleName string) error {
	return s.kc.AssignRoleToUser(context.Background(), bearer, userID, roleName)
}

func (s *rolesService) RemoveRoleFromUser(bearer, userID, roleName string) error {
	return s.kc.RemoveRoleFromUser(context.Background(), bearer, userID, roleName)
}

func (s *rolesService) GetUserRoles(bearer, userID string) ([]ports.Role, error) {
	roles, err := s.kc.GetUserRoles(context.Background(), bearer, userID)
	if err != nil {
		return nil, err
	}

	out := make([]ports.Role, 0, len(roles))
	for _, r := range roles {
		out = append(out, ports.Role{
			ID:          r.ID,
			Name:        r.Name,
			Description: r.Description,
			Composite:   r.Composite,
		})
	}
	return out, nil
}

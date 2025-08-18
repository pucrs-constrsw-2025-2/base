package services

import (
	"context"

	"github.com/your-org/oauth/internal/adapters/keycloak"
	"github.com/your-org/oauth/internal/ports"
)

type rolesService struct{ kc *keycloak.Client }

func NewRolesService(kc *keycloak.Client) ports.RolesPort { return &rolesService{kc: kc} }

func (s *rolesService) GetRoles(ctx context.Context, bearer string) ([]ports.Role, error) {
	roles, err := s.kc.GetRoles(ctx, bearer)
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

func (s *rolesService) GetRoleByName(ctx context.Context, bearer, name string) (ports.Role, error) {
	role, err := s.kc.GetRoleByName(ctx, bearer, name)
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

func (s *rolesService) CreateRole(ctx context.Context, bearer string, role ports.Role) error {
	kcRole := keycloak.KcRole{
		Name:        role.Name,
		Description: role.Description,
		Composite:   role.Composite,
	}
	return s.kc.CreateRole(ctx, bearer, kcRole)
}

func (s *rolesService) UpdateRole(ctx context.Context, bearer, name string, role ports.Role) error {
	kcRole := keycloak.KcRole{
		Name:        role.Name,
		Description: role.Description,
		Composite:   role.Composite,
	}
	return s.kc.UpdateRole(ctx, bearer, name, kcRole)
}

func (s *rolesService) DeleteRole(ctx context.Context, bearer, name string) error {
	return s.kc.DeleteRole(ctx, bearer, name)
}

func (s *rolesService) AssignRoleToUser(ctx context.Context, bearer, userID, roleName string) error {
	return s.kc.AssignRoleToUser(ctx, bearer, userID, roleName)
}

func (s *rolesService) RemoveRoleFromUser(ctx context.Context, bearer, userID, roleName string) error {
	return s.kc.RemoveRoleFromUser(ctx, bearer, userID, roleName)
}

func (s *rolesService) GetUserRoles(ctx context.Context, bearer, userID string) ([]ports.Role, error) {
	roles, err := s.kc.GetUserRoles(ctx, bearer, userID)
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

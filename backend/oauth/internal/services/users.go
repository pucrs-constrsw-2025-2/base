package services

import (
	"context"

	"github.com/your-org/oauth/internal/adapters/keycloak"
	"github.com/your-org/oauth/internal/ports"
)

type usersService struct{ kc *keycloak.Client }

func NewUsersService(kc *keycloak.Client) ports.UsersPort { return &usersService{kc: kc} }

func (s *usersService) CreateUser(ctx context.Context, bearer string, u ports.User) (ports.User, error) {
	id, err := s.kc.CreateUser(ctx, bearer, keycloakUserFrom(u), u.Password)
	if err != nil {
		return ports.User{}, err
	}
	u.ID = id
	u.Password = ""
	return u, nil
}

func (s *usersService) GetUsers(ctx context.Context, bearer string, enabled *bool) ([]ports.User, error) {
	us, err := s.kc.GetUsers(ctx, bearer, enabled)
	if err != nil {
		return nil, err
	}
	out := make([]ports.User, 0, len(us))
	for _, ku := range us {
		out = append(out, ports.User{ID: ku.ID, Username: ku.Username, FirstName: ku.FirstName, LastName: ku.LastName, Enabled: ku.Enabled})
	}
	return out, nil
}

func (s *usersService) GetUserByID(ctx context.Context, bearer, id string) (ports.User, error) {
	ku, err := s.kc.GetUserByID(ctx, bearer, id)
	if err != nil {
		return ports.User{}, err
	}
	return ports.User{
		ID:        ku.ID,
		Username:  ku.Username,
		FirstName: ku.FirstName,
		LastName:  ku.LastName,
		Enabled:   ku.Enabled,
	}, nil
}

func (s *usersService) UpdateUser(ctx context.Context, bearer, id string, u ports.User) error {
	kcUser := keycloakUserFrom(u)
	kcUser.ID = id // garantir que o ID seja mantido
	return s.kc.UpdateUser(ctx, bearer, id, kcUser)
}

func (s *usersService) UpdatePassword(ctx context.Context, bearer, id, newPassword string) error {
	return s.kc.UpdatePassword(ctx, bearer, id, newPassword)
}

func (s *usersService) DisableUser(ctx context.Context, bearer, id string) error {
	// Para desabilitar um usuário, precisamos primeiro buscar os dados atuais
	ku, err := s.kc.GetUserByID(ctx, bearer, id)
	if err != nil {
		return err
	}

	// Criar uma cópia com Enabled = false
	ku.Enabled = false

	// Atualizar o usuário
	return s.kc.UpdateUser(ctx, bearer, id, ku)
}

// --- mapeadores ---
func keycloakUserFrom(u ports.User) keycloak.KcUser {
	return keycloak.KcUser{ // campos exportados no mesmo pacote via type
		Username:  u.Username,
		FirstName: u.FirstName,
		LastName:  u.LastName,
		Enabled:   u.Enabled,
		Email:     u.Username,
	}
}

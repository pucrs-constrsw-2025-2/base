package services

import (
	"context"
	"github.com/your-org/oauth/internal/adapters/keycloak"
	"github.com/your-org/oauth/internal/ports"
)

type authService struct { kc *keycloak.Client }

func NewAuthService(kc *keycloak.Client) ports.AuthPort { return &authService{kc: kc} }

func (s *authService) PasswordLogin(username, password string) (ports.TokenResponse, error) {
	tr, err := s.kc.PasswordLogin(context.Background(), username, password)
	if err != nil { return ports.TokenResponse{}, err }
	return ports.TokenResponse{
		TokenType: tr.TokenType,
		AccessToken: tr.AccessToken,
		ExpiresIn: tr.ExpiresIn,
		RefreshToken: tr.RefreshToken,
		RefreshExpiresIn: tr.RefreshExpiresIn,
	}, nil
}



func (s *authService) RefreshToken(ctx context.Context, clientID, clientSecret, refreshToken, grantType string) (ports.TokenResponse, error) {
	req := keycloak.RefreshTokenRequest{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RefreshToken: refreshToken,
		GrantType:    grantType,
	}
	tr, err := s.kc.RefreshToken(ctx, req)
	if err != nil {
		return ports.TokenResponse{}, err
	}
	return ports.TokenResponse{
		TokenType:        tr.TokenType,
		AccessToken:      tr.AccessToken,
		ExpiresIn:        tr.ExpiresIn,
		RefreshToken:     tr.RefreshToken,
		RefreshExpiresIn: tr.RefreshExpiresIn,
	}, nil
}
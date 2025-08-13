package ports

// AuthPort define operações de autenticação expostas ao handler.
type AuthPort interface {
	PasswordLogin(username, password string) (TokenResponse, error)
}

type TokenResponse struct {
	TokenType        string `json:"token_type"`
	AccessToken      string `json:"access_token"`
	ExpiresIn        int    `json:"expires_in"`
	RefreshToken     string `json:"refresh_token"`
	RefreshExpiresIn int    `json:"refresh_expires_in"`
}
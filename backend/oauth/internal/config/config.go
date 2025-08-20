package config

import (
	"fmt"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type Config struct {
	// HTTP
	Host string `env:"OAUTH_HOST" envDefault:"0.0.0.0"`
	Port int    `env:"OAUTH_PORT" envDefault:"8181"`

	// Keycloak
	KCProtocol     string `env:"KEYCLOAK_INTERNAL_PROTOCOL" envDefault:"http"`
	KCHost string `env:"KEYCLOAK_INTERNAL_HOST" envDefault:"localhost"`
	KCPort string `env:"KEYCLOAK_INTERNAL_API_PORT" envDefault:"8080"`
	KCRealm        string `env:"KEYCLOAK_REALM,required"`
	KCClientID     string `env:"KEYCLOAK_CLIENT_ID,required"`
	KCClientSecret string `env:"KEYCLOAK_CLIENT_SECRET,required"`
}

func Load() (*Config, error) {
	// Carregar o arquivo .env
	_ = godotenv.Load()

	var c Config
	if err := env.Parse(&c); err != nil {
		return nil, err
	}
	return &c, nil
}

func (c *Config) HTTPAddr() string { return fmt.Sprintf("%s:%d", c.Host, c.Port) }

func (c *Config) KeycloakBaseURL() string {
	return fmt.Sprintf("%s://%s:%s", c.KCProtocol, c.KCHost, c.KCPort)
}

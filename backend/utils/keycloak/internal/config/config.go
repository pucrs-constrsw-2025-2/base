package config

import (
	"fmt"
	"github.com/caarlos0/env/v11"
)

type Config struct {
	// HTTP
	Host string `env:"OAUTH_HOST" envDefault:"0.0.0.0"`
	Port int    `env:"OAUTH_PORT" envDefault:"8080"`

	// Keycloak
	KCBaseURL      string `env:"KC_BASE_URL,required"`            // ex: http://keycloak:8080
	KCRealm        string `env:"KC_REALM,required"`               // ex: constrsw
	KCClientID     string `env:"KC_CLIENT_ID,required"`           // ex: oauth
	KCClientSecret string `env:"KC_CLIENT_SECRET,required"`
}

func Load() (*Config, error) {
	var c Config
	if err := env.Parse(&c); err != nil {
		return nil, err
	}
	return &c, nil
}

func (c *Config) HTTPAddr() string { return fmt.Sprintf("%s:%d", c.Host, c.Port) }
package main

import (
	"log"
	"github.com/your-org/oauth/internal/config"
	"github.com/your-org/oauth/internal/http/router"
	"github.com/your-org/oauth/internal/adapters/keycloak"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	kc := keycloak.NewClient(keycloak.Options{
		BaseURL:       cfg.KCBaseURL,
		Realm:         cfg.KCRealm,
		ClientID:      cfg.KCClientID,
		ClientSecret:  cfg.KCClientSecret,
		HTTPTimeoutMs: 15000,
	})

	r := router.New(cfg, kc)
	if err := r.Run(cfg.HTTPAddr()); err != nil { // ex: ":8080"
		log.Fatalf("server error: %v", err)
	}
}
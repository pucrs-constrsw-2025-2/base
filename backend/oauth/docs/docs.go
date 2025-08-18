package docs

import "github.com/swaggo/swag"

const docTemplate = `{
    "swagger": "2.0",
    "info": {
        "title": "OAuth API",
        "description": "API de autenticação e gerenciamento de usuários com Keycloak",
        "version": "1.0.0"
    },
    "host": "localhost:8080",
    "basePath": "/",
    "schemes": ["http"],
    "paths": {
        "/login": {
            "post": {
                "summary": "Login de usuário",
                "consumes": ["application/json"],
                "produces": ["application/json"],
                "parameters": [
                    {
                        "in": "body",
                        "name": "credentials",
                        "required": true,
                        "schema": {
                            "type": "object",
                            "properties": {
                                "username": {"type": "string"},
                                "password": {"type": "string"}
                            }
                        }
                    }
                ],
                "responses": {
                    "201": {"description": "Login realizado com sucesso"},
                    "401": {"description": "Credenciais inválidas"}
                }
            }
        },
        "/health": {
            "get": {
                "summary": "Health check",
                "produces": ["application/json"],
                "responses": {
                    "200": {"description": "API funcionando"}
                }
            }
        }
    }
}`

func init() {
	swag.Register("swagger", &swag.Spec{
		Version:          "1.0.0",
		Host:             "localhost:8080",
		BasePath:         "/",
		Schemes:          []string{"http"},
		Title:            "OAuth API",
		Description:      "API de autenticação e gerenciamento de usuários com Keycloak",
		InfoInstanceName: "swagger",
		SwaggerTemplate:  docTemplate,
	})
}

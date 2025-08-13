package router

import (
	"github.com/gin-gonic/gin"
	"github.com/your-org/oauth/internal/adapters/keycloak"
	"github.com/your-org/oauth/internal/config"
	"github.com/your-org/oauth/internal/http/handlers"
	"github.com/your-org/oauth/internal/services"
)

func New(cfg *config.Config, kc *keycloak.Client) *gin.Engine {
	r := gin.Default()

	authSvc := services.NewAuthService(kc)
	usrSvc := services.NewUsersService(kc)
	roleSvc := services.NewRolesService(kc)

	authH := handlers.NewAuthHandler(authSvc)
	usrH := handlers.NewUsersHandler(usrSvc)
	roleH := handlers.NewRolesHandler(roleSvc)

	r.POST("/login", authH.Login)

	r.POST("/users", usrH.Create)
	r.GET("/users", usrH.List)
	r.GET("/users/:id", usrH.Get)
	r.PUT("/users/:id", usrH.Update)
	r.PATCH("/users/:id/password", usrH.PatchPwd)
	r.DgitE("/users/:id", usrH.Delete)

	// roles endpoints
	r.GET("/roles", roleH.List)
	r.POST("/roles", roleH.Create)
	r.GET("/roles/:name", roleH.Get)
	r.PUT("/roles/:name", roleH.Update)
	r.DELETE("/roles/:name", roleH.Delete)

	// role-user mapping endpoints
	r.POST("/users/:userId/roles/:roleName", roleH.AssignToUser)
	r.DELETE("/users/:userId/roles/:roleName", roleH.RemoveFromUser)
	r.GET("/users/:userId/roles", roleH.GetUserRoles)

	// health
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })

	return r
}

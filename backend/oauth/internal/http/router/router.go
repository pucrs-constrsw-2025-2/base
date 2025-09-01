package router

import (
	"github.com/gin-gonic/gin"
	"github.com/your-org/oauth/internal/adapters/keycloak"
	"github.com/your-org/oauth/internal/config"
	"github.com/your-org/oauth/internal/http/handlers"
	"github.com/your-org/oauth/internal/services"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
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
	r.DELETE("/users/:id", usrH.Delete)

	roles := r.Group("/roles")
	{
		roles.GET("", roleH.List)
		roles.POST("", roleH.Create)

		// --- ROTAS PARA GERENCIAR USUÁRIOS DE UMA ROLE (POR NOME) ---
		// A adição do "/by-name/" remove o conflito com "/:id"
		roles.POST("/by-name/:roleName/users/:userId", roleH.AssignUserToRole)
		roles.DELETE("/by-name/:roleName/users/:userId", roleH.RemoveUserFromRole)

		// --- ROTAS PARA OPERAÇÕES DIRETAS NA ROLE (POR ID) ---
		roles.GET("/:id", roleH.Get)
		roles.PUT("/:id", roleH.Update)
		roles.PATCH("/:id", roleH.Patch)
		roles.DELETE("/:id", roleH.Delete)
	}

	// role-user mapping endpoints
	r.POST("/user-roles/:userId/:roleName", roleH.AssignToUser)
	r.DELETE("/user-roles/:userId/:roleName", roleH.RemoveFromUser)
	r.GET("/user-roles/:userId", roleH.GetUserRoles)

	// swagger documentation
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	r.Static("/openapi", "../../openapi")

	// health
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })

	return r
}

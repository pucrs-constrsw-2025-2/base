package router

import (
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
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

	// .env, por exemplo: "http://localhost:3000,http://outro.site"
	allowedOriginsEnv := os.Getenv("CORS_ALLOWED_ORIGINS")
	if allowedOriginsEnv == "" {
		allowedOriginsEnv = "http://localhost:3000"
	}

	allowedOrigins := strings.Split(allowedOriginsEnv, ",")

	r.Use(cors.New(cors.Config{
		// 4. Use o slice de origens que foi lido do ambiente
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"POST", "GET", "OPTIONS", "PUT", "PATCH", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

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

	// roles endpoints
	r.GET("/roles", roleH.List)
	r.POST("/roles", roleH.Create)
	r.GET("/roles/:id", roleH.Get)
	r.PUT("/roles/:id", roleH.Update)
	r.PATCH("/roles/:id", roleH.Patch)
	r.DELETE("/roles/:id", roleH.Delete)

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

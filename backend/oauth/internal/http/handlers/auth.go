package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/your-org/oauth/internal/ports"
)

type AuthHandler struct{ svc ports.AuthPort }

func NewAuthHandler(svc ports.AuthPort) *AuthHandler { return &AuthHandler{svc: svc} }

type loginReq struct {
	Username string `form:"username" json:"username" binding:"required"`
	Password string `form:"password" json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var in loginReq
	if err := c.ShouldBind(&in); err != nil {
		c.JSON(http.StatusBadRequest, Err("400", "invalid request body", "OAuthAPI", err))
		return
	}
	tr, err := h.svc.PasswordLogin(c.Request.Context(), in.Username, in.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, Err("401", "invalid credentials", "Keycloak", err))
		return
	}
	c.JSON(http.StatusCreated, tr)
}

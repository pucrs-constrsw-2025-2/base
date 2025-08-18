package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"context"
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
	tr, err := h.svc.PasswordLogin(context.Background(), in.Username, in.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, Err("401", "invalid credentials", "Keycloak", err))
		return
	}
	c.JSON(http.StatusCreated, tr)
}

type refreshTokenReq struct {
	ClientID     string `form:"client_id" json:"client_id" binding:"required"`
	ClientSecret string `form:"client_secret" json:"client_secret"`
	RefreshToken string `form:"refresh_token" json:"refresh_token" binding:"required"`
	GrantType    string `form:"grant_type" json:"grant_type" binding:"required"`
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req refreshTokenReq
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, Err("400", "invalid request body", "OAuthAPI", err))
		return
	}
	tr, err := h.svc.RefreshToken(context.Background(), req.ClientID, req.ClientSecret, req.RefreshToken, req.GrantType)
	if err != nil {
		c.JSON(http.StatusUnauthorized, Err("401", "invalid refresh token", "Keycloak", err))
		return
	}
	c.JSON(http.StatusOK, tr)
}
package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/your-org/oauth/internal/ports"
)

type UsersHandler struct{ svc ports.UsersPort }

func NewUsersHandler(svc ports.UsersPort) *UsersHandler { return &UsersHandler{svc: svc} }

func (h *UsersHandler) Create(c *gin.Context) {
	bearer := extractBearer(c)
	if bearer == "" {
		c.JSON(http.StatusUnauthorized, Err("401", "missing token", "OAuthAPI", nil))
		return
	}

	var in ports.User
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, Err("400", "invalid body", "OAuthAPI", err))
		return
	}
	if in.Username == "" {
		c.JSON(http.StatusBadRequest, Err("400", "username required", "OAuthAPI", nil))
		return
	}
	if in.Password == "" {
		c.JSON(http.StatusBadRequest, Err("400", "password required", "OAuthAPI", nil))
		return
	}

	u, err := h.svc.CreateUser(c.Request.Context(), bearer, in)
	if err != nil {
		status := http.StatusInternalServerError
		if isConflict(err) {
			status = http.StatusConflict
		}
		c.JSON(status, Err("409", "username already exists", "Keycloak", err))
		return
	}
	c.JSON(http.StatusCreated, u)
}

func (h *UsersHandler) List(c *gin.Context) {
	bearer := extractBearer(c)
	if bearer == "" {
		c.JSON(http.StatusUnauthorized, Err("401", "missing token", "OAuthAPI", nil))
		return
	}
	var enabledPtr *bool
	if v, ok := c.GetQuery("enabled"); ok {
		if v == "true" {
			t := true
			enabledPtr = &t
		} else if v == "false" {
			f := false
			enabledPtr = &f
		}
	}
	us, err := h.svc.GetUsers(c.Request.Context(), bearer, enabledPtr)
	if err != nil {
		c.JSON(http.StatusForbidden, Err("403", "forbidden", "Keycloak", err))
		return
	}
	c.JSON(http.StatusOK, us)
}

func (h *UsersHandler) Get(c *gin.Context) {
	bearer := extractBearer(c)
	if bearer == "" {
		c.JSON(http.StatusUnauthorized, Err("401", "missing token", "OAuthAPI", nil))
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, Err("400", "missing user id", "OAuthAPI", nil))
		return
	}

	u, err := h.svc.GetUserByID(c.Request.Context(), bearer, id)
	if err != nil {
		if err.Error() == "404: not found" {
			c.JSON(http.StatusNotFound, Err("404", "user not found", "Keycloak", err))
			return
		}
		c.JSON(http.StatusForbidden, Err("403", "forbidden", "Keycloak", err))
		return
	}
	c.JSON(http.StatusOK, u)
}

func (h *UsersHandler) Update(c *gin.Context) {
	bearer := extractBearer(c)
	if bearer == "" {
		c.JSON(http.StatusUnauthorized, Err("401", "missing token", "OAuthAPI", nil))
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, Err("400", "missing user id", "OAuthAPI", nil))
		return
	}

	var in ports.User
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, Err("400", "invalid body", "OAuthAPI", err))
		return
	}

	if in.Username == "" {
		c.JSON(http.StatusBadRequest, Err("400", "username required", "OAuthAPI", nil))
		return
	}

	err := h.svc.UpdateUser(c.Request.Context(), bearer, id, in)
	if err != nil {
		if err.Error() == "404: not found" {
			c.JSON(http.StatusNotFound, Err("404", "user not found", "Keycloak", err))
			return
		}
		c.JSON(http.StatusInternalServerError, Err("500", "update failed", "Keycloak", err))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user updated successfully"})
}

func (h *UsersHandler) PatchPwd(c *gin.Context) {
	bearer := extractBearer(c)
	if bearer == "" {
		c.JSON(http.StatusUnauthorized, Err("401", "missing token", "OAuthAPI", nil))
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, Err("400", "missing user id", "OAuthAPI", nil))
		return
	}

	var req struct {
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, Err("400", "invalid body or missing password", "OAuthAPI", err))
		return
	}

	err := h.svc.UpdatePassword(c.Request.Context(), bearer, id, req.Password)
	if err != nil {
		if err.Error() == "404: not found" {
			c.JSON(http.StatusNotFound, Err("404", "user not found", "Keycloak", err))
			return
		}
		c.JSON(http.StatusInternalServerError, Err("500", "password update failed", "Keycloak", err))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "password updated successfully"})
}

func (h *UsersHandler) Delete(c *gin.Context) {
	bearer := extractBearer(c)
	if bearer == "" {
		c.JSON(http.StatusUnauthorized, Err("401", "missing token", "OAuthAPI", nil))
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, Err("400", "missing user id", "OAuthAPI", nil))
		return
	}

	err := h.svc.DisableUser(c.Request.Context(), bearer, id)
	if err != nil {
		if err.Error() == "404: not found" {
			c.JSON(http.StatusNotFound, Err("404", "user not found", "Keycloak", err))
			return
		}
		c.JSON(http.StatusInternalServerError, Err("500", "delete failed", "Keycloak", err))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user disabled successfully"})
}

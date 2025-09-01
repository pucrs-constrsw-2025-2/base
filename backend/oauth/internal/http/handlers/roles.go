package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/your-org/oauth/internal/ports"
)

type RolesHandler struct{ svc ports.RolesPort }

func NewRolesHandler(svc ports.RolesPort) *RolesHandler { return &RolesHandler{svc: svc} }

func (h *RolesHandler) List(c *gin.Context) {
	bearer := extractBearer(c)
	if bearer == "" {
		c.JSON(http.StatusUnauthorized, Err("401", "missing token", "OAuthAPI", nil))
		return
	}

	roles, err := h.svc.GetRoles(c.Request.Context(), bearer)
	if err != nil {
		c.JSON(http.StatusForbidden, Err("403", "forbidden", "Keycloak", err))
		return
	}
	c.JSON(http.StatusOK, roles)
}

func (h *RolesHandler) Get(c *gin.Context) {
	bearer := extractBearer(c)
	if bearer == "" {
		c.JSON(http.StatusUnauthorized, Err("401", "missing token", "OAuthAPI", nil))
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, Err("400", "missing role id", "OAuthAPI", nil))
		return
	}

	role, err := h.svc.GetRoleByID(c.Request.Context(), bearer, id)
	if err != nil {
		if err.Error() == "404: not found" {
			c.JSON(http.StatusNotFound, Err("404", "role not found", "Keycloak", err))
			return
		}
		c.JSON(http.StatusForbidden, Err("403", "forbidden", "Keycloak", err))
		return
	}
	c.JSON(http.StatusOK, role)
}

func (h *RolesHandler) Create(c *gin.Context) {
	bearer := extractBearer(c)
	if bearer == "" {
		c.JSON(http.StatusUnauthorized, Err("401", "missing token", "OAuthAPI", nil))
		return
	}

	var in ports.Role
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, Err("400", "invalid body", "OAuthAPI", err))
		return
	}
	if in.Name == "" {
		c.JSON(http.StatusBadRequest, Err("400", "role name required", "OAuthAPI", nil))
		return
	}

	err := h.svc.CreateRole(c.Request.Context(), bearer, in)
	if err != nil {
		if isConflict(err) {
			c.JSON(http.StatusConflict, Err("409", "role already exists", "Keycloak", err))
			return
		}
		c.JSON(http.StatusInternalServerError, Err("500", "create failed", "Keycloak", err))
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "role created successfully"})
}

func (h *RolesHandler) Update(c *gin.Context) {
	bearer := extractBearer(c)
	if bearer == "" {
		c.JSON(http.StatusUnauthorized, Err("401", "missing token", "OAuthAPI", nil))
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, Err("400", "missing role id", "OAuthAPI", nil))
		return
	}

	var in ports.Role
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, Err("400", "invalid body", "OAuthAPI", err))
		return
	}

	err := h.svc.UpdateRole(c.Request.Context(), bearer, id, in)
	if err != nil {
		if err.Error() == "404: not found" {
			c.JSON(http.StatusNotFound, Err("404", "role not found", "Keycloak", err))
			return
		}
		c.JSON(http.StatusInternalServerError, Err("500", "update failed", "Keycloak", err))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "role updated successfully"})
}

func (h *RolesHandler) Patch(c *gin.Context) {
	bearer := extractBearer(c)
	if bearer == "" {
		c.JSON(http.StatusUnauthorized, Err("401", "missing token", "OAuthAPI", nil))
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, Err("400", "missing role id", "OAuthAPI", nil))
		return
	}

	var in ports.Role
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, Err("400", "invalid body", "OAuthAPI", err))
		return
	}

	err := h.svc.PatchRole(c.Request.Context(), bearer, id, in)
	if err != nil {
		if err.Error() == "404: not found" {
			c.JSON(http.StatusNotFound, Err("404", "role not found", "Keycloak", err))
			return
		}
		c.JSON(http.StatusInternalServerError, Err("500", "update failed", "Keycloak", err))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "role updated successfully"})
}

func (h *RolesHandler) Delete(c *gin.Context) {
	bearer := extractBearer(c)
	if bearer == "" {
		c.JSON(http.StatusUnauthorized, Err("401", "missing token", "OAuthAPI", nil))
		return
	}

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, Err("400", "missing role id", "OAuthAPI", nil))
		return
	}

	err := h.svc.DeleteRole(c.Request.Context(), bearer, id)
	if err != nil {
		if err.Error() == "404: not found" {
			c.JSON(http.StatusNotFound, Err("404", "role not found", "Keycloak", err))
			return
		}
		c.JSON(http.StatusInternalServerError, Err("500", "delete failed", "Keycloak", err))
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *RolesHandler) AssignToUser(c *gin.Context) {
	bearer := extractBearer(c)
	if bearer == "" {
		c.JSON(http.StatusUnauthorized, Err("401", "missing token", "OAuthAPI", nil))
		return
	}

	userID := c.Param("userId")
	roleName := c.Param("roleName")
	if userID == "" || roleName == "" {
		c.JSON(http.StatusBadRequest, Err("400", "missing user ID or role name", "OAuthAPI", nil))
		return
	}

	err := h.svc.AssignRoleToUser(c.Request.Context(), bearer, userID, roleName)
	if err != nil {
		if err.Error() == "404: not found" {
			c.JSON(http.StatusNotFound, Err("404", "user or role not found", "Keycloak", err))
			return
		}
		c.JSON(http.StatusInternalServerError, Err("500", "assignment failed", "Keycloak", err))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "role assigned to user successfully"})
}

func (h *RolesHandler) RemoveFromUser(c *gin.Context) {
	bearer := extractBearer(c)
	if bearer == "" {
		c.JSON(http.StatusUnauthorized, Err("401", "missing token", "OAuthAPI", nil))
		return
	}

	userID := c.Param("userId")
	roleName := c.Param("roleName")
	if userID == "" || roleName == "" {
		c.JSON(http.StatusBadRequest, Err("400", "missing user ID or role name", "OAuthAPI", nil))
		return
	}

	err := h.svc.RemoveRoleFromUser(c.Request.Context(), bearer, userID, roleName)
	if err != nil {
		if err.Error() == "404: not found" {
			c.JSON(http.StatusNotFound, Err("404", "user or role not found", "Keycloak", err))
			return
		}
		c.JSON(http.StatusInternalServerError, Err("500", "removal failed", "Keycloak", err))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "role removed from user successfully"})
}

func (h *RolesHandler) GetUserRoles(c *gin.Context) {
	bearer := extractBearer(c)
	if bearer == "" {
		c.JSON(http.StatusUnauthorized, Err("401", "missing token", "OAuthAPI", nil))
		return
	}

	userID := c.Param("userId")
	if userID == "" {
		c.JSON(http.StatusBadRequest, Err("400", "missing user ID", "OAuthAPI", nil))
		return
	}

	roles, err := h.svc.GetUserRoles(c.Request.Context(), bearer, userID)
	if err != nil {
		if err.Error() == "404: not found" {
			c.JSON(http.StatusNotFound, Err("404", "user not found", "Keycloak", err))
			return
		}
		c.JSON(http.StatusForbidden, Err("403", "forbidden", "Keycloak", err))
		return
	}
	c.JSON(http.StatusOK, roles)
}

// Adicione estas duas novas funções ao final do arquivo handlers/roles.go

func (h *RolesHandler) AssignUserToRole(c *gin.Context) {
	bearer := extractBearer(c)
	if bearer == "" {
		c.JSON(http.StatusUnauthorized, Err("401", "missing token", "OAuthAPI", nil))
		return
	}

	userID := c.Param("userId")
	roleName := c.Param("roleName")
	if userID == "" || roleName == "" {
		c.JSON(http.StatusBadRequest, Err("400", "missing user ID or role name", "OAuthAPI", nil))
		return
	}

	err := h.svc.AssignRoleToUser(c.Request.Context(), bearer, userID, roleName)
	if err != nil {
		if err.Error() == "404: not found" {
			c.JSON(http.StatusNotFound, Err("404", "user or role not found", "Keycloak", err))
			return
		}
		c.JSON(http.StatusInternalServerError, Err("500", "assignment failed", "Keycloak", err))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user assigned to role successfully"})
}

func (h *RolesHandler) RemoveUserFromRole(c *gin.Context) {
	bearer := extractBearer(c)
	if bearer == "" {
		c.JSON(http.StatusUnauthorized, Err("401", "missing token", "OAuthAPI", nil))
		return
	}

	userID := c.Param("userId")
	roleName := c.Param("roleName")
	if userID == "" || roleName == "" {
		c.JSON(http.StatusBadRequest, Err("400", "missing user ID or role name", "OAuthAPI", nil))
		return
	}

	err := h.svc.RemoveRoleFromUser(c.Request.Context(), bearer, userID, roleName)
	if err != nil {
		if err.Error() == "404: not found" {
			c.JSON(http.StatusNotFound, Err("404", "user or role not found", "Keycloak", err))
			return
		}
		c.JSON(http.StatusInternalServerError, Err("500", "removal failed", "Keycloak", err))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user removed from role successfully"})
}
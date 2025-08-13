package handlers

import (
	"strings"
	"github.com/gin-gonic/gin"
	"errors"
)

func extractBearer(c *gin.Context) string {
	h := c.GetHeader("Authorization")
	if h == "" { return "" }
	if !strings.HasPrefix(h, "Bearer ") { return "" }
	return strings.TrimPrefix(h, "Bearer ")
}

func isConflict(err error) bool { return err != nil && strings.HasPrefix(err.Error(), "409:") }

var ErrNotFound = errors.New("404: not found")
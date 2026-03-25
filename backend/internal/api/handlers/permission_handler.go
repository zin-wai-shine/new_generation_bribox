package handlers

import (
	"net/http"

	"github.com/brebox/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PermissionHandler struct {
	service *service.PermissionService
}

func NewPermissionHandler(s *service.PermissionService) *PermissionHandler {
	return &PermissionHandler{service: s}
}

type GeneratePermissionRequest struct {
	PropertyID string `json:"property_id" binding:"required"`
	OwnerID    string `json:"owner_id" binding:"required"`
	AgentID    string `json:"agent_id" binding:"required"`
	Message    string `json:"message"`
}

func (h *PermissionHandler) Generate(c *gin.Context) {
	var req GeneratePermissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	propertyID, _ := uuid.Parse(req.PropertyID)
	ownerID, _ := uuid.Parse(req.OwnerID)
	agentID, _ := uuid.Parse(req.AgentID)

	permission, link, err := h.service.Generate(propertyID, ownerID, agentID, req.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"permission": permission,
		"link":       link,
		"full_url":   c.Request.Host + link,
	})
}

func (h *PermissionHandler) Verify(c *gin.Context) {
	token := c.Param("token")

	// Default to approved when owner clicks the link
	permission, err := h.service.Verify(token, true)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return a user-friendly HTML response for the owner
	c.Header("Content-Type", "text/html")
	c.String(http.StatusOK, `
		<!DOCTYPE html>
		<html>
		<head>
			<title>Permission Approved - Brebox</title>
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<style>
				body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f0fdf4; }
				.card { background: white; border-radius: 16px; padding: 48px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.1); max-width: 400px; }
				.icon { font-size: 64px; margin-bottom: 16px; }
				h1 { color: #064E3B; margin: 0 0 8px; }
				p { color: #6b7280; line-height: 1.6; }
			</style>
		</head>
		<body>
			<div class="card">
				<div class="icon">✅</div>
				<h1>Thank You!</h1>
				<p>You have approved the listing for property <strong>`+permission.Property.Title+`</strong>.</p>
				<p>The agent has been notified and will proceed with the listing.</p>
			</div>
		</body>
		</html>
	`)
}

package handlers

import (
	"net/http"

	"github.com/brebox/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	propertyService   *service.PropertyService
	permissionService *service.PermissionService
	historyService    *service.HistoryService
}

func NewDashboardHandler(p *service.PropertyService, perm *service.PermissionService, h *service.HistoryService) *DashboardHandler {
	return &DashboardHandler{
		propertyService:   p,
		permissionService: perm,
		historyService:    h,
	}
}

func (h *DashboardHandler) GetStats(c *gin.Context) {
	propertyStats, err := h.propertyService.GetStats(nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	pendingPermissions, err := h.permissionService.GetPendingCount()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"properties":          propertyStats,
		"pending_permissions": pendingPermissions,
	})
}

func (h *DashboardHandler) GetRecentActivity(c *gin.Context) {
	activities, err := h.historyService.GetRecentActivity(20)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": activities})
}

package handlers

import (
	"net/http"
	"strconv"

	"github.com/brebox/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type HistoryHandler struct {
	service *service.HistoryService
}

func NewHistoryHandler(s *service.HistoryService) *HistoryHandler {
	return &HistoryHandler{service: s}
}

func (h *HistoryHandler) GetByProperty(c *gin.Context) {
	propertyID, err := uuid.Parse(c.Param("propertyId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid property ID"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	entries, total, err := h.service.GetByProperty(propertyID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  entries,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

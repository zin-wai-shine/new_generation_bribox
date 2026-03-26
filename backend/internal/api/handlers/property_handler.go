package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/brebox/backend/internal/api/websocket"
	"github.com/brebox/backend/internal/models"
	"github.com/brebox/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PropertyHandler struct {
	service *service.PropertyService
	history *service.HistoryService
	hub     *websocket.Hub
}

func NewPropertyHandler(s *service.PropertyService, h *service.HistoryService, hub *websocket.Hub) *PropertyHandler {
	return &PropertyHandler{service: s, history: h, hub: hub}
}

func (h *PropertyHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	status := c.Query("status")

	var agentID *uuid.UUID
	if aid := c.Query("agent_id"); aid != "" {
		id, err := uuid.Parse(aid)
		if err == nil {
			agentID = &id
		}
	}

	properties, total, err := h.service.List(agentID, status, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  properties,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (h *PropertyHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	property, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Property not found"})
		return
	}

	c.JSON(http.StatusOK, property)
}

func (h *PropertyHandler) Create(c *gin.Context) {
	var property models.Property
	if err := c.ShouldBindJSON(&property); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.Create(&property); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, property)
}

func (h *PropertyHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	existing, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Property not found"})
		return
	}

	if err := c.ShouldBindJSON(existing); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.Update(existing); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, existing)
}

func (h *PropertyHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := h.service.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Property deleted"})
}

type ScrapeRequest map[string]string

func (h *PropertyHandler) ScrapeFB(c *gin.Context) {
	var req ScrapeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	url := req["url"]
	go backgroundScrapeProcess(h.hub, url)
	c.JSON(http.StatusAccepted, gin.H{"status": "processing_started"})
}

func backgroundScrapeProcess(hub *websocket.Hub, targetUrl string) {
	time.Sleep(1 * time.Second)
	hub.Broadcast(websocket.Message{Type: "scrape_data", Data: map[string]string{"title": "Luxury Condo BTS Thonglor", "price": "12,500,000 THB", "location": "Watthana, Bangkok", "original_text": "Selling fast! Beautiful condo near BTS. 2 beds, 1 bath, high floor."}})

	time.Sleep(2 * time.Second)
	hub.Broadcast(websocket.Message{Type: "scrape_image", Data: map[string]string{"id": "img_1", "status": "downloading"}})
	time.Sleep(1 * time.Second)
	hub.Broadcast(websocket.Message{Type: "scrape_image", Data: map[string]string{"id": "img_1", "status": "cleaned", "url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"}})

	time.Sleep(1 * time.Second)
	hub.Broadcast(websocket.Message{Type: "scrape_image", Data: map[string]string{"id": "img_2", "status": "downloading"}})
	time.Sleep(1 * time.Second)
	hub.Broadcast(websocket.Message{Type: "scrape_image", Data: map[string]string{"id": "img_2", "status": "cleaned", "url": "https://images.unsplash.com/photo-1502672260266-1c1e525044c7"}})

	time.Sleep(1 * time.Second)
	hub.Broadcast(websocket.Message{Type: "scrape_complete", Data: map[string]string{"status": "done"}})
}

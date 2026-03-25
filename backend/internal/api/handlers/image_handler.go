package handlers

import (
	"net/http"

	"github.com/brebox/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ImageHandler struct {
	service *service.ImageService
}

func NewImageHandler(s *service.ImageService) *ImageHandler {
	return &ImageHandler{service: s}
}

type ProcessImageRequest struct {
	PropertyID    string   `json:"property_id" binding:"required"`
	ImagePaths    []string `json:"image_paths" binding:"required"`
	WatermarkPath string   `json:"watermark_path"`
}

func (h *ImageHandler) SubmitProcessing(c *gin.Context) {
	var req ProcessImageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	propertyID, err := uuid.Parse(req.PropertyID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid property_id"})
		return
	}

	jobID := h.service.SubmitJob(propertyID, req.ImagePaths, req.WatermarkPath)

	c.JSON(http.StatusAccepted, gin.H{
		"job_id":  jobID,
		"message": "Image processing job submitted",
	})
}

func (h *ImageHandler) GetStatus(c *gin.Context) {
	jobID := c.Param("jobId")

	status := h.service.GetJobStatus(jobID)
	if status == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	c.JSON(http.StatusOK, status)
}

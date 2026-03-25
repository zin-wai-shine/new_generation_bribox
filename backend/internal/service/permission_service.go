package service

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/brebox/backend/internal/api/websocket"
	"github.com/brebox/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PermissionService struct {
	BaseService
	Hub *websocket.Hub
}

func NewPermissionService(db *gorm.DB, hub *websocket.Hub) *PermissionService {
	return &PermissionService{
		BaseService: BaseService{DB: db},
		Hub:         hub,
	}
}

// Generate creates a new permission link for an owner
func (s *PermissionService) Generate(propertyID, ownerID, agentID uuid.UUID, message string) (*models.Permission, string, error) {
	permission := &models.Permission{
		PropertyID: propertyID,
		OwnerID:    ownerID,
		AgentID:    agentID,
		Status:     models.PermissionPending,
		Message:    message,
		ExpiresAt:  time.Now().Add(72 * time.Hour), // 3 days
	}

	if err := s.DB.Create(permission).Error; err != nil {
		return nil, "", err
	}

	// Generate the permission verification link
	link := fmt.Sprintf("/api/v1/permissions/verify/%s", permission.Token)

	// Log to history
	details, _ := json.Marshal(map[string]string{
		"permission_id": permission.ID.String(),
		"token":         permission.Token,
		"message":       message,
	})
	s.DB.Create(&models.History{
		PropertyID: propertyID,
		AgentID:    agentID,
		ActionType: models.ActionPermissionSent,
		Title:      "Permission link sent to owner",
		Details:    details,
	})

	return permission, link, nil
}

// Verify handles the owner clicking YES on the permission link
func (s *PermissionService) Verify(token string, approved bool) (*models.Permission, error) {
	var permission models.Permission
	if err := s.DB.Preload("Property").Preload("Owner").
		First(&permission, "token = ?", token).Error; err != nil {
		return nil, fmt.Errorf("permission not found")
	}

	if permission.Status != models.PermissionPending {
		return nil, fmt.Errorf("permission already %s", permission.Status)
	}

	if time.Now().After(permission.ExpiresAt) {
		permission.Status = models.PermissionExpired
		s.DB.Save(&permission)
		return nil, fmt.Errorf("permission link has expired")
	}

	now := time.Now()
	if approved {
		permission.Status = models.PermissionApproved
		permission.ApprovedAt = &now

		// Update property status to active
		s.DB.Model(&models.Property{}).Where("id = ?", permission.PropertyID).
			Update("status", models.PropertyActive)

		// Log to history
		details, _ := json.Marshal(map[string]string{
			"permission_id": permission.ID.String(),
			"action":        "approved",
		})
		s.DB.Create(&models.History{
			PropertyID: permission.PropertyID,
			AgentID:    permission.AgentID,
			ActionType: models.ActionPermissionApproved,
			Title:      "Owner approved permission",
			Details:    details,
		})

		// Broadcast via WebSocket to all connected agents
		s.Hub.Broadcast(websocket.Message{
			Type: "permission_approved",
			Data: map[string]interface{}{
				"permission_id": permission.ID,
				"property_id":   permission.PropertyID,
				"owner_name":    permission.Owner.Name,
			},
		})
	} else {
		permission.Status = models.PermissionRejected
	}

	s.DB.Save(&permission)
	return &permission, nil
}

// ListByProperty returns all permissions for a property
func (s *PermissionService) ListByProperty(propertyID uuid.UUID) ([]models.Permission, error) {
	var permissions []models.Permission
	err := s.DB.Preload("Owner").Where("property_id = ?", propertyID).
		Order("created_at DESC").Find(&permissions).Error
	return permissions, err
}

// GetPendingCount returns count of pending permissions
func (s *PermissionService) GetPendingCount() (int64, error) {
	var count int64
	err := s.DB.Model(&models.Permission{}).Where("status = ?", "pending").Count(&count).Error
	return count, err
}

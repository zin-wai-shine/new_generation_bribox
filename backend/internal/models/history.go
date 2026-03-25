package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ActionType for history timeline entries
type ActionType string

const (
	ActionCreated          ActionType = "created"
	ActionUpdated          ActionType = "updated"
	ActionScraped          ActionType = "scraped"
	ActionPermissionSent   ActionType = "permission_sent"
	ActionPermissionApproved ActionType = "permission_approved"
	ActionPermissionRejected ActionType = "permission_rejected"
	ActionImageProcessed   ActionType = "image_processed"
	ActionOwnerContacted   ActionType = "owner_contacted"
	ActionViewing          ActionType = "viewing"
	ActionNote             ActionType = "note"
	ActionStatusChanged    ActionType = "status_changed"
	ActionCall             ActionType = "call"
)

// History represents a timeline entry for property interactions
type History struct {
	ID         uuid.UUID       `gorm:"type:uuid;primary_key" json:"id"`
	PropertyID uuid.UUID       `gorm:"type:uuid;not null;index" json:"property_id"`
	AgentID    uuid.UUID       `gorm:"type:uuid;index" json:"agent_id"`
	ActionType ActionType      `gorm:"type:varchar(30);not null" json:"action_type"`
	Title      string          `json:"title"`
	Details    json.RawMessage `gorm:"type:jsonb" json:"details"`
	LocationLat *float64       `json:"location_lat,omitempty"`
	LocationLng *float64       `json:"location_lng,omitempty"`
	CreatedAt  time.Time       `json:"created_at"`
	Property   Property        `gorm:"foreignKey:PropertyID" json:"property,omitempty"`
	Agent      Agent           `gorm:"foreignKey:AgentID" json:"agent,omitempty"`
}

func (h *History) BeforeCreate(tx *gorm.DB) error {
	if h.ID == uuid.Nil {
		h.ID = uuid.New()
	}
	return nil
}

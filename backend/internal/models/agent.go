package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Agent represents a real estate agent using the platform
type Agent struct {
	ID           uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
	Name         string         `gorm:"not null" json:"name"`
	Email        string         `gorm:"uniqueIndex;not null" json:"email"`
	Phone        string         `json:"phone"`
	Company      string         `json:"company"`
	WatermarkURL string         `json:"watermark_url"`
	AvatarURL    string         `json:"avatar_url"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	Properties   []Property     `gorm:"foreignKey:AgentID" json:"properties,omitempty"`
}

func (a *Agent) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}

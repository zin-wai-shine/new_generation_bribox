package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PermissionStatus for the permission link workflow
type PermissionStatus string

const (
	PermissionPending  PermissionStatus = "pending"
	PermissionApproved PermissionStatus = "approved"
	PermissionRejected PermissionStatus = "rejected"
	PermissionExpired  PermissionStatus = "expired"
)

// Permission represents a permission link sent to an owner
type Permission struct {
	ID         uuid.UUID        `gorm:"type:uuid;primary_key" json:"id"`
	PropertyID uuid.UUID        `gorm:"type:uuid;not null;index" json:"property_id"`
	OwnerID    uuid.UUID        `gorm:"type:uuid;not null;index" json:"owner_id"`
	AgentID    uuid.UUID        `gorm:"type:uuid;not null;index" json:"agent_id"`
	Token      string           `gorm:"uniqueIndex;not null" json:"token"`
	Status     PermissionStatus `gorm:"type:varchar(20);default:'pending'" json:"status"`
	Message    string           `json:"message"`
	ExpiresAt  time.Time        `json:"expires_at"`
	ApprovedAt *time.Time       `json:"approved_at,omitempty"`
	CreatedAt  time.Time        `json:"created_at"`
	UpdatedAt  time.Time        `json:"updated_at"`
	Property   Property         `gorm:"foreignKey:PropertyID" json:"property,omitempty"`
	Owner      Owner            `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Agent      Agent            `gorm:"foreignKey:AgentID" json:"agent,omitempty"`
}

func (p *Permission) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	if p.Token == "" {
		p.Token = uuid.New().String()
	}
	return nil
}

package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AvailabilityStatus represents the owner's availability
type AvailabilityStatus string

const (
	StatusAvailable   AvailabilityStatus = "available"
	StatusBusy        AvailabilityStatus = "busy"
	StatusUnavailable AvailabilityStatus = "unavailable"
	StatusUnknown     AvailabilityStatus = "unknown"
)

// ViewingTimes stores preferred viewing time slots as JSON
type ViewingTimes []ViewingSlot

type ViewingSlot struct {
	Day       string `json:"day"`
	StartTime string `json:"start_time"`
	EndTime   string `json:"end_time"`
}

func (vt ViewingTimes) Value() (driver.Value, error) {
	return json.Marshal(vt)
}

func (vt *ViewingTimes) Scan(value interface{}) error {
	if value == nil {
		*vt = ViewingTimes{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, vt)
}

// Owner represents a property owner
type Owner struct {
	ID                 uuid.UUID          `gorm:"type:uuid;primary_key" json:"id"`
	Name               string             `gorm:"not null" json:"name"`
	Phone              string             `json:"phone"`
	Email              string             `json:"email"`
	LineID             string             `json:"line_id"`
	FacebookURL        string             `json:"facebook_url"`
	AvailabilityStatus AvailabilityStatus `gorm:"type:varchar(20);default:'unknown'" json:"availability_status"`
	ViewingTimes       ViewingTimes       `gorm:"type:jsonb" json:"viewing_times"`
	Notes              string             `json:"notes"`
	CreatedAt          time.Time          `json:"created_at"`
	UpdatedAt          time.Time          `json:"updated_at"`
	DeletedAt          gorm.DeletedAt     `gorm:"index" json:"-"`
	Properties         []Property         `gorm:"foreignKey:OwnerID" json:"properties,omitempty"`
}

func (o *Owner) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return nil
}

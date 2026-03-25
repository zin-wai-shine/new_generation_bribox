package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ImageCategory for AI smart sort
type ImageCategory string

const (
	CategoryBuilding   ImageCategory = "building"
	CategoryFacilities ImageCategory = "facilities"
	CategoryLivingRoom ImageCategory = "living_room"
	CategoryBedroom    ImageCategory = "bedroom"
	CategoryBathroom   ImageCategory = "bathroom"
	CategoryKitchen    ImageCategory = "kitchen"
	CategoryExterior   ImageCategory = "exterior"
	CategoryOther      ImageCategory = "other"
)

// ProcessingStatus for image processing state
type ProcessingStatus string

const (
	ProcessingPending    ProcessingStatus = "pending"
	ProcessingRunning    ProcessingStatus = "processing"
	ProcessingCompleted  ProcessingStatus = "completed"
	ProcessingFailed     ProcessingStatus = "failed"
)

// PropertyImage represents an image attached to a property
type PropertyImage struct {
	ID               uuid.UUID        `gorm:"type:uuid;primary_key" json:"id"`
	PropertyID       uuid.UUID        `gorm:"type:uuid;not null;index" json:"property_id"`
	OriginalURL      string           `gorm:"not null" json:"original_url"`
	ProcessedURL     string           `json:"processed_url"`
	ThumbnailURL     string           `json:"thumbnail_url"`
	WatermarkedURL   string           `json:"watermarked_url"`
	Category         ImageCategory    `gorm:"type:varchar(20);default:'other'" json:"category"`
	SortOrder        int              `json:"sort_order"`
	Width            int              `json:"width"`
	Height           int              `json:"height"`
	FileSizeBytes    int64            `json:"file_size_bytes"`
	ProcessingStatus ProcessingStatus `gorm:"type:varchar(20);default:'pending'" json:"processing_status"`
	IsPublic         bool             `gorm:"default:false" json:"is_public"`
	CreatedAt        time.Time        `json:"created_at"`
	UpdatedAt        time.Time        `json:"updated_at"`
}

func (pi *PropertyImage) BeforeCreate(tx *gorm.DB) error {
	if pi.ID == uuid.Nil {
		pi.ID = uuid.New()
	}
	return nil
}

package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PropertyStatus represents the listing status
type PropertyStatus string

const (
	PropertyDraft     PropertyStatus = "draft"
	PropertyPending   PropertyStatus = "pending"
	PropertyActive    PropertyStatus = "active"
	PropertySold      PropertyStatus = "sold"
	PropertyRented    PropertyStatus = "rented"
	PropertyArchived  PropertyStatus = "archived"
)

// PropertyType represents the type of property
type PropertyType string

const (
	TypeHouse      PropertyType = "house"
	TypeCondo      PropertyType = "condo"
	TypeTownhouse  PropertyType = "townhouse"
	TypeLand       PropertyType = "land"
	TypeCommercial PropertyType = "commercial"
	TypeApartment  PropertyType = "apartment"
)

// GeoPoint stores GPS coordinates
type GeoPoint struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

func (g GeoPoint) Value() (driver.Value, error) {
	return json.Marshal(g)
}

func (g *GeoPoint) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, g)
}

// Property represents a real estate listing
type Property struct {
	ID              uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
	AgentID         uuid.UUID      `gorm:"type:uuid;not null;index" json:"agent_id"`
	OwnerID         *uuid.UUID     `gorm:"type:uuid;index" json:"owner_id,omitempty"`
	Title           string         `gorm:"not null" json:"title"`
	Description     string         `json:"description"`
	Price           float64        `json:"price"`
	PriceUnit       string         `gorm:"default:'THB'" json:"price_unit"`
	PropertyType    PropertyType   `gorm:"type:varchar(20)" json:"property_type"`
	Status          PropertyStatus `gorm:"type:varchar(20);default:'draft'" json:"status"`
	Address         string         `json:"address"`
	District        string         `json:"district"`
	Province        string         `json:"province"`
	PostalCode      string         `json:"postal_code"`
	Location        GeoPoint       `gorm:"type:jsonb" json:"location"`
	Bedrooms        int            `json:"bedrooms"`
	Bathrooms       int            `json:"bathrooms"`
	AreaSqm         float64        `json:"area_sqm"`
	LandAreaSqWah   float64        `json:"land_area_sq_wah"`
	Floor           int            `json:"floor"`
	TotalFloors     int            `json:"total_floors"`
	Furnishing      string         `json:"furnishing"`
	FacebookPostURL string         `json:"facebook_post_url"`
	SourceData      json.RawMessage `gorm:"type:jsonb" json:"source_data,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
	Agent           Agent          `gorm:"foreignKey:AgentID" json:"agent,omitempty"`
	Owner           *Owner         `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Images          []PropertyImage `gorm:"foreignKey:PropertyID" json:"images,omitempty"`
	Permissions     []Permission   `gorm:"foreignKey:PropertyID" json:"permissions,omitempty"`
}

func (p *Property) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

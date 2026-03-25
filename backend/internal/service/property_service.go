package service

import (
	"github.com/brebox/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PropertyService struct {
	BaseService
}

func NewPropertyService(db *gorm.DB) *PropertyService {
	return &PropertyService{BaseService{DB: db}}
}

func (s *PropertyService) List(agentID *uuid.UUID, status string, page, limit int) ([]models.Property, int64, error) {
	var properties []models.Property
	var total int64

	query := s.DB.Model(&models.Property{})

	if agentID != nil {
		query = query.Where("agent_id = ?", *agentID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	offset := (page - 1) * limit
	err := query.Preload("Images").Preload("Owner").
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&properties).Error

	return properties, total, err
}

func (s *PropertyService) GetByID(id uuid.UUID) (*models.Property, error) {
	var property models.Property
	err := s.DB.Preload("Images").Preload("Owner").Preload("Agent").Preload("Permissions").
		First(&property, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &property, nil
}

func (s *PropertyService) Create(property *models.Property) error {
	return s.DB.Create(property).Error
}

func (s *PropertyService) Update(property *models.Property) error {
	return s.DB.Save(property).Error
}

func (s *PropertyService) Delete(id uuid.UUID) error {
	return s.DB.Delete(&models.Property{}, "id = ?", id).Error
}

func (s *PropertyService) GetStats(agentID *uuid.UUID) (map[string]int64, error) {
	stats := make(map[string]int64)

	var total, active, pending, sold int64

	query := s.DB.Model(&models.Property{})
	if agentID != nil {
		query = query.Where("agent_id = ?", *agentID)
	}

	query.Count(&total)
	s.DB.Model(&models.Property{}).Where("status = ?", "active").Count(&active)
	s.DB.Model(&models.Property{}).Where("status = ?", "pending").Count(&pending)
	s.DB.Model(&models.Property{}).Where("status = ?", "sold").Count(&sold)

	stats["total"] = total
	stats["active"] = active
	stats["pending"] = pending
	stats["sold"] = sold

	return stats, nil
}

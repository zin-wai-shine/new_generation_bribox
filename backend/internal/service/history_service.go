package service

import (
	"github.com/brebox/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type HistoryService struct {
	BaseService
}

func NewHistoryService(db *gorm.DB) *HistoryService {
	return &HistoryService{BaseService{DB: db}}
}

func (s *HistoryService) GetByProperty(propertyID uuid.UUID, page, limit int) ([]models.History, int64, error) {
	var entries []models.History
	var total int64

	query := s.DB.Model(&models.History{}).Where("property_id = ?", propertyID)
	query.Count(&total)

	offset := (page - 1) * limit
	err := query.Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&entries).Error

	return entries, total, err
}

func (s *HistoryService) Create(entry *models.History) error {
	return s.DB.Create(entry).Error
}

func (s *HistoryService) GetRecentActivity(limit int) ([]models.History, error) {
	var entries []models.History
	err := s.DB.Preload("Property").
		Order("created_at DESC").
		Limit(limit).
		Find(&entries).Error
	return entries, err
}

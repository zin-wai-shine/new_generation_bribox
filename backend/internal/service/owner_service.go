package service

import (
	"github.com/brebox/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OwnerService struct {
	BaseService
}

func NewOwnerService(db *gorm.DB) *OwnerService {
	return &OwnerService{BaseService{DB: db}}
}

func (s *OwnerService) List(page, limit int) ([]models.Owner, int64, error) {
	var owners []models.Owner
	var total int64

	s.DB.Model(&models.Owner{}).Count(&total)

	offset := (page - 1) * limit
	err := s.DB.Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&owners).Error

	return owners, total, err
}

func (s *OwnerService) GetByID(id uuid.UUID) (*models.Owner, error) {
	var owner models.Owner
	err := s.DB.Preload("Properties").First(&owner, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &owner, nil
}

func (s *OwnerService) Create(owner *models.Owner) error {
	return s.DB.Create(owner).Error
}

func (s *OwnerService) Update(owner *models.Owner) error {
	return s.DB.Save(owner).Error
}

func (s *OwnerService) Delete(id uuid.UUID) error {
	return s.DB.Delete(&models.Owner{}, "id = ?", id).Error
}

func (s *OwnerService) UpdateAvailability(id uuid.UUID, status models.AvailabilityStatus) error {
	return s.DB.Model(&models.Owner{}).Where("id = ?", id).
		Update("availability_status", status).Error
}

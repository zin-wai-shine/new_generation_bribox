package service

import (
	"gorm.io/gorm"
)

// Services aggregates all service dependencies
type Services struct {
	Property   *PropertyService
	Owner      *OwnerService
	Permission *PermissionService
	Image      *ImageService
	History    *HistoryService
}

// BaseService provides common database access
type BaseService struct {
	DB *gorm.DB
}

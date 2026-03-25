package service

import (
	"github.com/brebox/backend/internal/imagelab"
	"github.com/google/uuid"
)

type ImageService struct {
	WorkerPool *imagelab.WorkerPool
}

func NewImageService(pool *imagelab.WorkerPool) *ImageService {
	return &ImageService{WorkerPool: pool}
}

// SubmitJob sends images for processing through the worker pool
func (s *ImageService) SubmitJob(propertyID uuid.UUID, imagePaths []string, watermarkPath string) string {
	jobID := uuid.New().String()

	job := &imagelab.Job{
		ID:            jobID,
		PropertyID:    propertyID.String(),
		ImagePaths:    imagePaths,
		WatermarkPath: watermarkPath,
	}

	s.WorkerPool.Submit(job)
	return jobID
}

// GetJobStatus returns the current status of a processing job
func (s *ImageService) GetJobStatus(jobID string) *imagelab.JobStatus {
	return s.WorkerPool.GetStatus(jobID)
}

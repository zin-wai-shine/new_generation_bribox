package imagelab

import (
	"fmt"
	"log"
	"sync"
)

// Processor interface for image processing backends
type Processor interface {
	Process(imagePath string) (string, error)
	Categorize(imagePath string) (string, error)
	Watermark(imagePath, watermarkPath string) (string, error)
}

// NewProcessor creates a processor based on the type
func NewProcessor(processorType string) Processor {
	switch processorType {
	case "api":
		return &AIProcessor{}
	default:
		return &MockProcessor{}
	}
}

// Job represents a batch image processing job
type Job struct {
	ID            string
	PropertyID    string
	ImagePaths    []string
	WatermarkPath string
}

// JobStatus tracks the progress of a processing job
type JobStatus struct {
	ID             string   `json:"id"`
	Status         string   `json:"status"` // pending, processing, completed, failed
	TotalImages    int      `json:"total_images"`
	ProcessedCount int      `json:"processed_count"`
	Results        []Result `json:"results"`
	Error          string   `json:"error,omitempty"`
}

// Result represents the output of processing a single image
type Result struct {
	OriginalPath    string `json:"original_path"`
	ProcessedPath   string `json:"processed_path"`
	WatermarkedPath string `json:"watermarked_path,omitempty"`
	Category        string `json:"category"`
	Error           string `json:"error,omitempty"`
}

// WorkerPool manages concurrent image processing
type WorkerPool struct {
	workers   int
	processor Processor
	jobs      chan *Job
	statuses  map[string]*JobStatus
	mu        sync.RWMutex
}

func NewWorkerPool(workers int, processor Processor) *WorkerPool {
	return &WorkerPool{
		workers:   workers,
		processor: processor,
		jobs:      make(chan *Job, 100),
		statuses:  make(map[string]*JobStatus),
	}
}

func (wp *WorkerPool) Start() {
	log.Printf("🖼️ Image Lab started with %d workers", wp.workers)
	for i := 0; i < wp.workers; i++ {
		go wp.worker(i)
	}
}

func (wp *WorkerPool) Submit(job *Job) {
	wp.mu.Lock()
	wp.statuses[job.ID] = &JobStatus{
		ID:          job.ID,
		Status:      "pending",
		TotalImages: len(job.ImagePaths),
	}
	wp.mu.Unlock()

	wp.jobs <- job
}

func (wp *WorkerPool) GetStatus(jobID string) *JobStatus {
	wp.mu.RLock()
	defer wp.mu.RUnlock()
	return wp.statuses[jobID]
}

func (wp *WorkerPool) worker(id int) {
	for job := range wp.jobs {
		wp.processJob(id, job)
	}
}

func (wp *WorkerPool) processJob(workerID int, job *Job) {
	wp.mu.Lock()
	wp.statuses[job.ID].Status = "processing"
	wp.mu.Unlock()

	log.Printf("Worker %d processing job %s (%d images)", workerID, job.ID, len(job.ImagePaths))

	var results []Result

	for _, imgPath := range job.ImagePaths {
		// Process (upscale)
		processedPath, err := wp.processor.Process(imgPath)
		if err != nil {
			results = append(results, Result{
				OriginalPath: imgPath,
				Error:        err.Error(),
			})
			continue
		}

		// Categorize
		category, _ := wp.processor.Categorize(imgPath)

		result := Result{
			OriginalPath:  imgPath,
			ProcessedPath: processedPath,
			Category:      category,
		}

		// Watermark if path provided
		if job.WatermarkPath != "" {
			watermarked, err := wp.processor.Watermark(processedPath, job.WatermarkPath)
			if err == nil {
				result.WatermarkedPath = watermarked
			}
		}

		results = append(results, result)

		// Update progress
		wp.mu.Lock()
		wp.statuses[job.ID].ProcessedCount++
		wp.statuses[job.ID].Results = results
		wp.mu.Unlock()
	}

	wp.mu.Lock()
	wp.statuses[job.ID].Status = "completed"
	wp.statuses[job.ID].Results = results
	wp.mu.Unlock()

	log.Printf("Worker %d completed job %s", workerID, job.ID)
}

// MockProcessor simulates AI image processing without external APIs
type MockProcessor struct{}

func (p *MockProcessor) Process(imagePath string) (string, error) {
	// In mock mode, simulate processing by returning a modified path
	processedPath := fmt.Sprintf("%s_processed", imagePath)
	log.Printf("  [MOCK] Upscaled: %s -> %s", imagePath, processedPath)
	return processedPath, nil
}

func (p *MockProcessor) Categorize(imagePath string) (string, error) {
	// Simple heuristic-based categorization for mock mode
	categories := []string{"building", "living_room", "bedroom", "bathroom", "kitchen", "facilities"}
	// Use hash of filename to pick a consistent category
	idx := len(imagePath) % len(categories)
	category := categories[idx]
	log.Printf("  [MOCK] Categorized: %s -> %s", imagePath, category)
	return category, nil
}

func (p *MockProcessor) Watermark(imagePath, watermarkPath string) (string, error) {
	watermarkedPath := fmt.Sprintf("%s_watermarked", imagePath)
	log.Printf("  [MOCK] Watermarked: %s", watermarkedPath)
	return watermarkedPath, nil
}

// AIProcessor connects to external AI APIs for real image processing
type AIProcessor struct{}

func (p *AIProcessor) Process(imagePath string) (string, error) {
	// TODO: Integrate with Real-ESRGAN or similar API
	log.Printf("  [AI] Processing: %s (API integration pending)", imagePath)
	return fmt.Sprintf("%s_ai_processed", imagePath), nil
}

func (p *AIProcessor) Categorize(imagePath string) (string, error) {
	// TODO: Integrate with AI Vision API for smart categorization
	log.Printf("  [AI] Categorizing: %s (API integration pending)", imagePath)
	return "other", nil
}

func (p *AIProcessor) Watermark(imagePath, watermarkPath string) (string, error) {
	// TODO: Use Go image library for real watermark overlay
	log.Printf("  [AI] Watermarking: %s (implementation pending)", imagePath)
	return fmt.Sprintf("%s_watermarked", imagePath), nil
}

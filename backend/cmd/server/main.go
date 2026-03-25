package main

import (
	"fmt"
	"log"
	"os"

	"github.com/brebox/backend/internal/api"
	"github.com/brebox/backend/internal/api/websocket"
	"github.com/brebox/backend/internal/database"
	"github.com/brebox/backend/internal/imagelab"
	"github.com/brebox/backend/internal/service"
)

func main() {
	// Connect to database
	db, err := database.Connect()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run migrations
	if err := database.Migrate(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize WebSocket hub
	hub := websocket.NewHub()
	go hub.Run()

	// Initialize image processor
	processorType := os.Getenv("IMAGE_PROCESSOR")
	if processorType == "" {
		processorType = "mock"
	}
	imageProcessor := imagelab.NewProcessor(processorType)
	workerPool := imagelab.NewWorkerPool(4, imageProcessor)
	go workerPool.Start()

	// Initialize services
	services := &service.Services{
		Property:   service.NewPropertyService(db),
		Owner:      service.NewOwnerService(db),
		Permission: service.NewPermissionService(db, hub),
		Image:      service.NewImageService(workerPool),
		History:    service.NewHistoryService(db),
	}

	// Setup and run API server
	port := os.Getenv("API_PORT")
	if port == "" {
		port = "8080"
	}

	router := api.SetupRouter(services, hub)
	log.Printf("🚀 Brebox API starting on port %s", port)
	if err := router.Run(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

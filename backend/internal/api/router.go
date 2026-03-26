package api

import (
	"os"

	"github.com/brebox/backend/internal/api/handlers"
	"github.com/brebox/backend/internal/api/websocket"
	"github.com/brebox/backend/internal/service"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(services *service.Services, hub *websocket.Hub) *gin.Engine {
	router := gin.Default()

	// CORS configuration
	allowedOrigins := os.Getenv("WS_ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "http://localhost:3000"
	}

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{allowedOrigins, "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Health check
	router.GET("/api/v1/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "brebox-api"})
	})

	// Initialize handlers
	propertyHandler := handlers.NewPropertyHandler(services.Property, services.History, hub)
	ownerHandler := handlers.NewOwnerHandler(services.Owner)
	permissionHandler := handlers.NewPermissionHandler(services.Permission)
	imageHandler := handlers.NewImageHandler(services.Image)
	historyHandler := handlers.NewHistoryHandler(services.History)
	dashboardHandler := handlers.NewDashboardHandler(services.Property, services.Permission, services.History)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Properties
		props := v1.Group("/properties")
		{
			props.GET("", propertyHandler.List)
			props.POST("", propertyHandler.Create)
			props.POST("/scrape", propertyHandler.ScrapeFB)
			props.GET("/:id", propertyHandler.GetByID)
			props.PUT("/:id", propertyHandler.Update)
			props.DELETE("/:id", propertyHandler.Delete)
		}

		// Owners
		owners := v1.Group("/owners")
		{
			owners.GET("", ownerHandler.List)
			owners.POST("", ownerHandler.Create)
			owners.GET("/:id", ownerHandler.GetByID)
			owners.PUT("/:id", ownerHandler.Update)
			owners.DELETE("/:id", ownerHandler.Delete)
		}

		// Permissions
		perms := v1.Group("/permissions")
		{
			perms.POST("/generate", permissionHandler.Generate)
			perms.GET("/verify/:token", permissionHandler.Verify)
		}

		// Images
		images := v1.Group("/images")
		{
			images.POST("/process", imageHandler.SubmitProcessing)
			images.GET("/status/:jobId", imageHandler.GetStatus)
		}

		// History
		v1.GET("/history/:propertyId", historyHandler.GetByProperty)

		// Dashboard
		v1.GET("/dashboard/stats", dashboardHandler.GetStats)
		v1.GET("/dashboard/activity", dashboardHandler.GetRecentActivity)
	}

	// WebSocket
	router.GET("/ws", hub.HandleWebSocket)

	return router
}

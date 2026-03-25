# 🏠 Brebox — Real Estate Super App

Cross-platform super app for real estate agents. Automate property listing, AI image processing, and owner management.

## Stack
- **Backend**: Go (Gin Gonic + GORM) — Port 8080
- **Frontend**: React (Vite + Tailwind CSS) — Port 3000
- **Mobile**: React Native (Expo)
- **Desktop**: Electron
- **Database**: PostgreSQL 15 + PostGIS

## Quick Start

### Option 1: Docker (Recommended)
```bash
# Clone and start all services
docker-compose up --build

# Access:
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080/api/v1/health
```

### Option 2: Run Locally

#### Database
```bash
# Start PostgreSQL with PostGIS
docker run -d --name brebox-db \
  -e POSTGRES_USER=brebox \
  -e POSTGRES_PASSWORD=brebox_secret_2024 \
  -e POSTGRES_DB=brebox \
  -p 5432:5432 \
  postgis/postgis:15-3.3
```

#### Backend
```bash
cd backend
go mod tidy
go run ./cmd/server
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Mobile
```bash
cd mobile
npm install
npx expo start
```

## Project Structure
```
brebox/
├── backend/           # Go API server
│   ├── cmd/server/    # Entry point
│   └── internal/      # API, models, services, imagelab, scraper
├── frontend/          # React + Vite + Tailwind
│   ├── src/pages/     # Dashboard, Properties, Owners, ImageLab, MapHistory
│   ├── src/components/# Layout, UI components
│   └── electron/      # Desktop wrapper
├── mobile/            # Expo React Native
│   └── app/(tabs)/    # Tab-based navigation
└── docker-compose.yml
```

## Features
- 🎨 Dark Green / White theme toggle
- 📊 Dashboard with KPI cards & live activity feed
- 🏢 Property management with search & filtering
- 👤 Owner contact management with availability status
- 🔗 Permission link workflow (generate → send → approve)
- 🖼️ AI Image Lab (upscale, categorize, watermark) with Mock Mode
- 🗺️ Map History with GPS timeline
- ⚡ WebSocket live sync across devices
- 📱 Mobile app (Expo)
- 🖥️ Desktop app (Electron)

## Environment Variables
See `.env.example` for all configuration options.

| Variable | Default | Description |
|----------|---------|-------------|
| `IMAGE_PROCESSOR` | `mock` | `mock` or `api` for AI image processing |
| `API_PORT` | `8080` | Backend server port |
| `DB_HOST` | `localhost` | PostgreSQL host |

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET/POST | `/api/v1/properties` | List / Create |
| GET/PUT/DELETE | `/api/v1/properties/:id` | CRUD |
| GET/POST | `/api/v1/owners` | List / Create |
| POST | `/api/v1/permissions/generate` | Generate permission link |
| GET | `/api/v1/permissions/verify/:token` | Owner approval |
| POST | `/api/v1/images/process` | Submit AI processing |
| GET | `/api/v1/images/status/:jobId` | Job status |
| WS | `/ws` | WebSocket live updates |

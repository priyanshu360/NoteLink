# NoteLink

NoteLink is a full-stack note management platform with a Go backend, MongoDB database, and React frontend.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Note Management**: CRUD operations with automatic timestamps
- **Full-text Search**: Search across note titles and content
- **Note Sharing**: Share notes with other users
- **Rate Limiting**: Built-in rate limiting via `golang.org/x/time/rate`

## 🛠 Tech Stack

### Backend
- **Language**: Go 1.21.3
- **Framework**: Gorilla Mux
- **Database**: MongoDB 6.0
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Rate Limiting**: golang.org/x/time/rate

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Custom CSS with responsive design
- **State Management**: React Hooks and Context API

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Quick Start
```bash
# Clone the repository
git clone https://github.com/priyanshu360/NoteLink.git
cd NoteLink

# Start the application
docker-compose up --build

# Backend API: http://localhost:8080
# Database: mongodb://admin:password123@localhost:27017/notelink
```

## Backend API

### Authentication Endpoints
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate user and get JWT token

### Note Endpoints (Protected)
- `GET /api/notes` - Get all user notes
- `GET /api/notes/{id}` - Get specific note
- `POST /api/notes` - Create new note
- `PUT /api/notes/{id}` - Update existing note
- `DELETE /api/notes/{id}` - Delete note
- `POST /api/notes/{id}/share` - Share note with user
- `GET /api/search?q={query}` - Search notes

## Testing

### Backend Tests
```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -v -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html
```

### Frontend
```bash
cd frontend
npm test
npm run build
```

## Recent Fixes

- **Single MongoDB connection**: Previously two separate connections were created per server instance. Now a single `mongo.Client` is shared across all repositories.
- **Centralized JWT secret**: Removed three duplicated `getJWTSecret()` functions and a hardcoded fallback in `utils/validators.go`. JWT secret now reads from `JWT_SECRET` env var in one place (`utils.GetJWTSecret()`).
- **Proper context propagation**: Replaced all 13 `context.TODO()` calls in the repository layer with request-scoped `context.Context` threaded from handlers through services to repositories, enabling proper cancellation and timeout propagation.
- **Wired up validators**: `utils/validators.go` `ValidateJWT()` is now used by `AuthMiddleware` and `getUserIDFromToken`, replacing inline JWT parsing.
- **Removed dead config**: `GIN_MODE=release` removed from `docker-compose.yml` (application uses Gorilla Mux, not Gin).
# NoteLink Deployment Guide

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Start the Application
```bash
git clone https://github.com/priyanshu360/NoteLink.git
cd NoteLink

# Start all services
docker-compose up --build

# Backend API: http://localhost:8080
# MongoDB: mongodb://admin:password123@localhost:27017/notelink
```

### Environment Variables
Create `.env` file:
```env
MONGODB_URL=mongodb://admin:password123@mongodb:27017/notelink?authSource=admin
DATABASE_NAME=notelink
JWT_SECRET=change-this-to-a-secure-random-string
PORT=8080
```

## CI/CD Pipeline

### GitHub Actions
See `.github/workflows/deploy.yml` for the current CI/CD configuration.

## Database

### Indexes
```javascript
db.users.createIndex({ "username": 1 }, { unique: true })
db.notes.createIndex({ "user_id": 1, "created_at": -1 })
db.notes.createIndex({ "title": "text", "content": "text" })
```

### Backup
```bash
docker exec notelink-mongodb mongodump --out /backup/$(date +%Y%m%d_%H%M%S)
```

## Troubleshooting

### Common Issues
1. **Port conflicts**: Change port mappings in docker-compose.yml
2. **Database connection**: Check MongoDB is running: `docker-compose ps`
3. **Build failures**: Clear Docker cache: `docker system prune -a`

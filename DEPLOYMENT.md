# NoteLink Deployment Guide

## Development Environment

### Prerequisites
- Docker and Docker Compose
- Git

### Quick Start
```bash
# Clone the repository
git clone https://github.com/priyanshu360/NoteLink.git
cd NoteLink

# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop environment
docker-compose -f docker-compose.dev.yml down
```

### Development URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- MongoDB: mongodb://admin:password123@localhost:27017/testdb

## Production Environment

### Environment Variables
Create `.env` file:
```env
# Database Configuration
MONGODB_URL=mongodb://admin:password123@mongodb:27017/testdb?authSource=admin
DATABASE_NAME=testdb

# Security
JWT_SECRET=your-very-secure-secret-key-change-this

# Server Configuration
PORT=8080
GIN_MODE=release

# Frontend
REACT_APP_API_URL=https://yourdomain.com/api
```

### Production Deployment
```bash
# Build and start production containers
docker-compose --profile production up --build -d

# Scale services if needed
docker-compose --profile production up --scale backend=3 --scale frontend=2 -d

# View running containers
docker-compose ps

# View logs
docker-compose logs -f
```

### Health Checks
- Backend Health: http://localhost:8080/health
- Frontend Health: http://localhost/health
- Database Health: `docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"`

## CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy NoteLink
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v3
        with:
          go-version: '1.21.3'
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: |
          cd backend && go test ./...
          cd ../frontend && npm test
      - run: docker-compose -f docker-compose.dev.yml up --build -d
      - run: sleep 30 && curl -f http://localhost:8080/health

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          docker-compose --profile production up --build -d
```

## Monitoring

### Health Monitoring
```bash
# Container health status
docker-compose ps

# Resource usage
docker stats

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Backup Strategy
```bash
# Database backup
docker-compose exec mongodb mongodump --out /backup/$(date +%Y%m%d_%H%M%S)

# Volume backup
docker run --rm -v notelink_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

## Security Considerations

### Production Checklist
- [ ] Change default passwords
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Regular security updates
- [ ] Implement rate limiting
- [ ] Use secrets management

### SSL/TLS Configuration
```bash
# Generate self-signed certificate for development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem

# For production, use Let's Encrypt
certbot --nginx -d yourdomain.com
```

## Performance Optimization

### Backend Optimization
- MongoDB indexes configured
- Connection pooling enabled
- Rate limiting implemented
- Gzip compression enabled

### Frontend Optimization
- Code splitting implemented
- Static asset caching
- Image optimization
- Bundle size optimization

### Database Optimization
```javascript
// Created indexes for optimal performance
db.users.createIndex({ "username": 1 }, { unique: true })
db.notes.createIndex({ "user_id": 1, "created_at": -1 })
db.notes.createIndex({ "title": "text", "content": "text" })
```

## Troubleshooting

### Common Issues
1. **Port conflicts**: Change port mappings in docker-compose.yml
2. **Database connection**: Check MongoDB health and credentials
3. **Build failures**: Clear Docker cache: `docker system prune -a`
4. **Memory issues**: Increase Docker memory limits

### Log Analysis
```bash
# Error logs
docker-compose logs --tail=100 backend | grep ERROR

# Database logs
docker-compose logs mongodb | grep -i "error\|warning"

# Access logs
docker-compose exec nginx cat /var/log/nginx/access.log
```

## Scaling

### Horizontal Scaling
```bash
# Scale backend services
docker-compose --profile production up --scale backend=3 -d

# Load balancer configuration updates automatically
```

### Database Scaling
- Consider MongoDB replica set for high availability
- Implement read replicas for read-heavy workloads
- Use sharding for large datasets
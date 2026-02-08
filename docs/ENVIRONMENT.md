# Environment Configuration Files

## Frontend Environment Variables

Create `frontend/.env.local` for development or `frontend/.env` for production:

### Required Variables
```env
REACT_APP_API_URL=http://localhost:8080/api  # Your API base URL
```

### Optional Variables
```env
# Application Settings
REACT_APP_ENVIRONMENT=development           # development|staging|production
REACT_APP_VERSION=1.0.0                    # Application version
REACT_APP_DEBUG_API=true                     # Enable API debugging

# UI/UX Settings
REACT_APP_THEME=light                        # light|dark
REACT_APP_ITEMS_PER_PAGE=20                  # Items to display per page
REACT_APP_MAX_NOTE_LENGTH=10000             # Max characters per note
REACT_APP_ENABLE_ANALYTICS=false             # Enable analytics tracking
REACT_APP_ENABLE_NOTIFICATIONS=false          # Enable browser notifications
REACT_APP_ENABLE_SHARING=true                # Enable note sharing

# API Configuration
REACT_APP_API_TIMEOUT=10000                 # API request timeout (ms)
REACT_APP_UPLOAD_TIMEOUT=30000               # File upload timeout (ms)
REACT_APP_RETRY_ATTEMPTS=3                  # Number of retry attempts

# Authentication
REACT_APP_TOKEN_REFRESH_THRESHOLD=300000      # Token refresh threshold (ms)
REACT_APP_SESSION_TIMEOUT=3600000            # Session timeout (ms)
REACT_APP_AUTO_LOGOUT=true                   # Auto logout on token expiry

# Search Configuration
REACT_APP_SEARCH_DEBOUNCE_TIME=300          # Search debounce time (ms)
REACT_APP_MIN_SEARCH_LENGTH=2                 # Min characters to search
REACT_APP_MAX_SEARCH_RESULTS=50              # Max search results

# Development Settings
REACT_APP_DEV_MODE=true                      # Development mode
REACT_APP_MOCK_API=false                     # Use mock API for testing
REACT_APP_LOG_LEVEL=info                     # Log level: debug|info|warn|error
```

## Backend Environment Variables

Create `.env` in root directory:

### Required Variables
```env
# Database
MONGODB_URL=mongodb://admin:password@localhost:27017/testdb?authSource=admin
DATABASE_NAME=testdb

# Security
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
PORT=8080
```

### Optional Variables
```env
# Server Configuration
GIN_MODE=release                              # debug|release|test
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST=10
RATE_LIMIT_CLEANUP_INTERVAL=60

# Database Configuration
DB_MAX_CONNECTIONS=100
DB_MAX_OPEN_CONNECTIONS=25
DB_CONNECTION_MAX_LIFETIME=5m
DB_INDEX_WAIT=true

# Security Settings
BCRYPT_ROUNDS=12
CORS_MAX_AGE=86400
ENABLE_CORS=true

# Logging
LOG_LEVEL=info                                 # debug|info|warn|error
LOG_FORMAT=json                               # json|text
LOG_FILE_PATH=/app/logs/app.log
LOG_MAX_SIZE=100                               # MB
LOG_MAX_BACKUPS=3

# SSL/TLS
SSL_MODE=disable                                # disable|require|verify-ca|verify-full
SSL_CERT_PATH=/etc/ssl/certs/server.crt
SSL_KEY_PATH=/etc/ssl/private/server.key

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_POOL_SIZE=10

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com
SMTP_TLS=true

# Monitoring
PROMETHEUS_PORT=9090
METRICS_PATH=/metrics
SENTRY_DSN=your-sentry-dsn
HEALTH_CHECK_INTERVAL=30

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *                      # Daily at 2 AM
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=your-backup-bucket
BACKUP_S3_REGION=us-east-1
BACKUP_S3_ACCESS_KEY=your-access-key
BACKUP_S3_SECRET_KEY=your-secret-key
```

## Environment-Specific Configurations

### Development (.env.dev)
```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG_API=true
REACT_APP_DEV_MODE=true
LOG_LEVEL=debug
GIN_MODE=debug
```

### Staging (.env.staging)
```env
REACT_APP_API_URL=https://staging-api.yourdomain.com/api
REACT_APP_ENVIRONMENT=staging
REACT_APP_DEBUG_API=true
LOG_LEVEL=info
GIN_MODE=release
```

### Production (.env.prod)
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_ENVIRONMENT=production
REACT_APP_DEBUG_API=false
REACT_APP_DEV_MODE=false
LOG_LEVEL=warn
GIN_MODE=release
RATE_LIMIT_REQUESTS_PER_MINUTE=30
```

## Security Best Practices

1. **Never commit `.env` files to version control**
2. **Use long, random secrets for production**
3. **Rotate secrets regularly**
4. **Use different values for different environments**
5. **Store sensitive data in secret management systems**
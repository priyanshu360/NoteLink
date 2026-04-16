# Environment Configuration

## Backend Environment Variables

Create `.env` in root directory:

### Database
| Variable | Default | Description |
|---|---|---|
| `MONGODB_URL` | `mongodb://localhost:27017` | MongoDB connection string |
| `DATABASE_NAME` | `testdb` | MongoDB database name |

### Security
| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | `your-secret-key` | Secret key for JWT token signing |

### Server
| Variable | Default | Description |
|---|---|---|
| `PORT` or `SERVER_PORT` | `8080` | HTTP server port |
| `SERVER_ADDRESS` | `0.0.0.0` | HTTP server bind address |
| `READ_TIMEOUT` | `5` | Read timeout in seconds |
| `WRITE_TIMEOUT` | `5` | Write timeout in seconds |

### Example `.env`
```env
MONGODB_URL=mongodb://admin:password@localhost:27017/notelink?authSource=admin
DATABASE_NAME=notelink
JWT_SECRET=change-this-to-a-secure-random-string
PORT=8080
```

## Frontend Environment Variables

Create `frontend/.env.local`:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

## Security Best Practices

1. Never commit `.env` files to version control
2. Use long, random secrets for production
3. Rotate secrets regularly
4. Use different values for different environments

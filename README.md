# NoteLink

NoteLink is a secure and scalable RESTful API designed for seamless note management and collaboration. Built with Go and MongoDB, it provides user authentication, note CRUD operations, search functionality, and note sharing capabilities.

## Features

- **User Authentication**: Secure JWT-based authentication with password hashing
- **Note Management**: Create, read, update, and delete notes
- **Search Functionality**: Full-text search across notes
- **Note Sharing**: Share notes with other users
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation and sanitization
- **RESTful API**: Clean and intuitive REST endpoints

## Tech Stack

- **Backend**: Go (Golang)
- **Web Framework**: Gorilla Mux
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Rate Limiting**: golang.org/x/time/rate

## API Endpoints

### Authentication

#### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "username": "johndoe"
}
```

#### POST /api/auth/login
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Notes (Protected Routes - Require JWT Token)

#### GET /api/notes
Get all notes for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "user_id": "507f1f77bcf86cd799439012",
    "title": "My First Note",
    "content": "This is the content of my note",
    "shared": false,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

#### GET /api/notes/{id}
Get a specific note by ID.

#### POST /api/notes
Create a new note.

**Request Body:**
```json
{
  "title": "New Note",
  "content": "This is a new note"
}
```

#### PUT /api/notes/{id}
Update an existing note.

**Request Body:**
```json
{
  "title": "Updated Note",
  "content": "This is the updated content"
}
```

#### DELETE /api/notes/{id}
Delete a note by ID.

#### POST /api/notes/{id}/share
Share a note with another user.

**Request Body:**
```json
{
  "target_user_id": "507f1f77bcf86cd799439013"
}
```

#### GET /api/search?q={query}
Search notes by query parameter.

**Query Parameters:**
- `q`: Search query string

## Getting Started

### Prerequisites

- Go 1.21.3 or higher
- MongoDB 4.4 or higher
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/priyanshu360/NoteLink.git
cd NoteLink
```

2. Install dependencies:
```bash
go mod tidy
```

3. Set up MongoDB:
```bash
# Start MongoDB service
sudo systemctl start mongod
# or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

4. Configure environment variables (optional):
```bash
export MONGODB_URL="mongodb://localhost:27017"
export DATABASE_NAME="notelink"
export JWT_SECRET="your-secret-key"
```

5. Run the application:
```bash
go run main.go
```

The server will start on `http://localhost:8080`.

### Running Tests

Run all tests:
```bash
go test ./...
```

Run tests with coverage:
```bash
go test -cover ./...
```

## Project Structure

```
NoteLink/
├── config/           # Configuration management
├── handlers/         # HTTP handlers for API endpoints
├── model/           # Data models and structs
├── repository/      # Data access layer
│   └── mongo/      # MongoDB implementations
├── service/         # Business logic layer
│   ├── note/       # Note service
│   └── user/       # User service
├── server/          # HTTP server setup and routing
├── utils/           # Utility functions
├── main.go          # Application entry point
└── README.md        # This file
```

## Configuration

The application can be configured using environment variables or by modifying the configuration files in the `config/` directory.

### Default Configuration

- **Port**: 8080
- **MongoDB URL**: mongodb://localhost:27017
- **Database Name**: testdb
- **JWT Secret**: your-secret-key
- **Rate Limit**: 2 requests per second, burst of 5

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation of all inputs
- **Rate Limiting**: Protection against brute force attacks
- **CORS Support**: Configurable CORS settings

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## API Documentation

For detailed API documentation, you can use tools like Postman or Insomnia to import the following collection:

### Base URL
```
http://localhost:8080/api
```

### Authentication Flow
1. Create an account using `POST /auth/signup`
2. Login to get a JWT token using `POST /auth/login`
3. Include the token in the Authorization header for all protected routes:
   `Authorization: Bearer <your-jwt-token>`

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**: Make sure MongoDB is running and accessible
2. **JWT Token Error**: Check that the JWT secret is the same across all services
3. **Rate Limiting**: If you receive "Rate limit exceeded", wait a moment before retrying

### Development Tips

- Use `go fmt` to format your code
- Run `go vet` to check for potential issues
- Write tests for new features
- Update documentation when adding new endpoints

## Performance Considerations

- MongoDB indexes are automatically created on frequently queried fields
- Rate limiting prevents abuse
- Connection pooling is used for database connections
- All responses are properly compressed when possible

## Future Enhancements

- [ ] Real-time collaboration using WebSockets
- [ ] Note categories and tags
- [ ] File attachments support
- [ ] Note versioning and history
- [ ] Advanced search with filters
- [ ] User roles and permissions
- [ ] Email notifications
- [ ] Mobile app support

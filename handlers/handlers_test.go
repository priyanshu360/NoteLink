package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/golang-jwt/jwt"
	"github.com/priyanshu360/NoteLink/model"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// MockUserService for testing
type MockUserService struct {
	createUserFunc func(*model.User) (*model.User, error)
	authUserFunc   func(model.User) (*model.User, error)
}

func (m *MockUserService) CreateUser(user *model.User) (*model.User, error) {
	if m.createUserFunc != nil {
		return m.createUserFunc(user)
	}
	return &model.User{ID: primitive.NewObjectID(), Username: user.Username}, nil
}

func (m *MockUserService) AuthenticateUser(credentials model.User) (*model.User, error) {
	if m.authUserFunc != nil {
		return m.authUserFunc(credentials)
	}
	return &model.User{ID: primitive.NewObjectID(), Username: credentials.Username, Password: "mock-token"}, nil
}

func TestCreateUserHandler(t *testing.T) {
	tests := []struct {
		name           string
		requestBody    interface{}
		expectedStatus int
		expectedError  string
	}{
		{
			name: "Valid user creation",
			requestBody: model.User{
				Username: "testuser",
				Password: "password123",
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Invalid JSON",
			requestBody:    "invalid json",
			expectedStatus: http.StatusBadRequest,
			expectedError:  "invalid character",
		},
		{
			name: "Missing username",
			requestBody: model.User{
				Password: "password123",
			},
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Username is required",
		},
		{
			name: "Missing password",
			requestBody: model.User{
				Username: "testuser",
			},
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Password is required",
		},
		{
			name: "Short password",
			requestBody: model.User{
				Username: "testuser",
				Password: "123",
			},
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Password must be at least 6 characters",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockService := &MockUserService{}
			handler := NewUserHandler(mockService)

			var body bytes.Buffer
			if err := json.NewEncoder(&body).Encode(tt.requestBody); err != nil {
				t.Fatal(err)
			}

			req := httptest.NewRequest(http.MethodPost, "/api/auth/signup", &body)
			w := httptest.NewRecorder()

			handler.CreateUserHandler(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			if tt.expectedError != "" {
				assert.Contains(t, w.Body.String(), tt.expectedError)
			}
		})
	}
}

func TestAuthenticateUserHandler(t *testing.T) {
	tests := []struct {
		name           string
		requestBody    interface{}
		expectedStatus int
		expectedError  string
	}{
		{
			name: "Valid authentication",
			requestBody: model.User{
				Username: "testuser",
				Password: "password123",
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Invalid JSON",
			requestBody:    "invalid json",
			expectedStatus: http.StatusBadRequest,
			expectedError:  "invalid character",
		},
		{
			name: "Missing username",
			requestBody: model.User{
				Password: "password123",
			},
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Username is required",
		},
		{
			name: "Missing password",
			requestBody: model.User{
				Username: "testuser",
			},
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Password is required",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockService := &MockUserService{}
			handler := NewUserHandler(mockService)

			var body bytes.Buffer
			if err := json.NewEncoder(&body).Encode(tt.requestBody); err != nil {
				t.Fatal(err)
			}

			req := httptest.NewRequest(http.MethodPost, "/api/auth/login", &body)
			w := httptest.NewRecorder()

			handler.AuthenticateUserHandler(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			if tt.expectedError != "" {
				assert.Contains(t, w.Body.String(), tt.expectedError)
			}
		})
	}
}

func TestGetUserIDFromToken(t *testing.T) {
	// Define the JWT secret for testing
	testJWTSecret := "your-secret-key"

	// Test case 1: Valid token
	validUserID := primitive.NewObjectID().Hex()
	validToken := generateTestToken(testJWTSecret, validUserID)
	requestWithValidToken := createTestRequest("Bearer " + validToken)
	userID, err := getUserIDFromToken(requestWithValidToken)

	expectedUserID, err := primitive.ObjectIDFromHex(validUserID)
	assert.NoError(t, err, "Expected no error for valid token")
	assert.Equal(t, expectedUserID, userID, "Expected correct user ID for valid token")

	// Test case 2: Invalid token format
	invalidToken := "invalidTokenFormat"
	requestWithInvalidToken := createTestRequest("Bearer " + invalidToken)
	_, err = getUserIDFromToken(requestWithInvalidToken)

	assert.Error(t, err, "Expected error for invalid token format")

	// Test case 3: Missing Authorization header
	requestWithoutAuthHeader := createTestRequest("")
	_, err = getUserIDFromToken(requestWithoutAuthHeader)

	assert.Error(t, err, "Expected error for missing Authorization header")
}

// Helper function to generate a test JWT token
func generateTestToken(secret, userID string) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &jwt.StandardClaims{
		Subject: userID,
	})
	signedToken, _ := token.SignedString([]byte(secret))
	return signedToken
}

// Helper function to create a test HTTP request with the given Authorization header
func createTestRequest(authHeader string) *http.Request {
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	request.Header.Set("Authorization", authHeader)
	return request
}

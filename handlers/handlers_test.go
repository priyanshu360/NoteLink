package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/golang-jwt/jwt"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

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

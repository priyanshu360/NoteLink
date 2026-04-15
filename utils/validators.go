package utils

import (
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt"
	"github.com/priyanshu360/NoteLink/model"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ValidateObjectID validates if a string is a valid MongoDB ObjectID
func ValidateObjectID(id string) (primitive.ObjectID, error) {
	return primitive.ObjectIDFromHex(id)
}

// GetJWTSecret returns the JWT secret from environment or a default
func GetJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key"
	}
	return secret
}

// ValidateJWT validates a JWT token and returns claims
func ValidateJWT(tokenString string) (*jwt.StandardClaims, error) {
	tokenString = strings.TrimPrefix(tokenString, "Bearer ")

	token, err := jwt.ParseWithClaims(tokenString, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(GetJWTSecret()), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*jwt.StandardClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	return claims, nil
}

// WriteJSONError writes a standardized JSON error response
func WriteJSONError(w http.ResponseWriter, apiErr *model.APIError) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(apiErr.Status)
	json.NewEncoder(w).Encode(apiErr)
}

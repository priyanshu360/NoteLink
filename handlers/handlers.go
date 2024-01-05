package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Assume you have a constant for the JWT secret key
const jwtSecret = "your-secret-key"

func getUserIDFromToken(r *http.Request) (primitive.ObjectID, error) {
	// Extract the Authorization header from the request
	tokenString := r.Header.Get("Authorization")
	if tokenString == "" {
		return primitive.NilObjectID, errors.New("Authorization header missing")
	}

	// Extract the token from the "Bearer" prefix
	tokenString = strings.TrimPrefix(tokenString, "Bearer ")

	// Parse the token
	token, err := jwt.ParseWithClaims(tokenString, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})

	if err != nil {
		return primitive.NilObjectID, err
	}

	// Extract user ID from the token claims
	claims, ok := token.Claims.(*jwt.StandardClaims)
	if !ok {
		return primitive.NilObjectID, errors.New("Invalid token claims")
	}

	userID, err := primitive.ObjectIDFromHex(claims.Subject)
	if err != nil {
		return primitive.NilObjectID, err
	}

	return userID, nil
}

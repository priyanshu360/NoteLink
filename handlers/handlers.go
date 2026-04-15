package handlers

import (
	"errors"
	"net/http"

	"github.com/priyanshu360/NoteLink/utils"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func getUserIDFromToken(r *http.Request) (primitive.ObjectID, error) {
	tokenString := r.Header.Get("Authorization")
	if tokenString == "" {
		return primitive.NilObjectID, errors.New("Authorization header missing")
	}

	claims, err := utils.ValidateJWT(tokenString)
	if err != nil {
		return primitive.NilObjectID, err
	}

	userID, err := primitive.ObjectIDFromHex(claims.Subject)
	if err != nil {
		return primitive.NilObjectID, err
	}

	return userID, nil
}

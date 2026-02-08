package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/priyanshu360/NoteLink/model"
	"github.com/priyanshu360/NoteLink/service"
)

// UserHandler provides HTTP handlers for user-related operations
type UserHandler struct {
	userService service.UserService
}

// NewUserHandler creates a new instance of UserHandler
func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// CreateUserHandler returns a handler for creating a new user
func (h *UserHandler) CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	var user model.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validate input
	if strings.TrimSpace(user.Username) == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(user.Password) == "" {
		http.Error(w, "Password is required", http.StatusBadRequest)
		return
	}

	if len(user.Password) < 6 {
		http.Error(w, "Password must be at least 6 characters", http.StatusBadRequest)
		return
	}

	createdUser, err := h.userService.CreateUser(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(createdUser)
}

// AuthenticateUserHandler returns a handler for authenticating a user
func (h *UserHandler) AuthenticateUserHandler(w http.ResponseWriter, r *http.Request) {
	var credentials model.User
	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validate input
	if strings.TrimSpace(credentials.Username) == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(credentials.Password) == "" {
		http.Error(w, "Password is required", http.StatusBadRequest)
		return
	}

	authenticatedUser, err := h.userService.AuthenticateUser(credentials)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Return user with JWT token
	response := map[string]interface{}{
		"user":  authenticatedUser,
		"token": authenticatedUser.Password, // Token is temporarily stored in password field
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

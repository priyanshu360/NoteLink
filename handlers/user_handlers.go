package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/priyanshu360/NoteLink/model"
	"github.com/priyanshu360/NoteLink/service"
	"github.com/priyanshu360/NoteLink/utils"
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
	var creds model.Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusBadRequest, err.Error()))
		return
	}

	user := &model.User{Username: creds.Username, Password: creds.Password}
	createdUser, err := h.userService.CreateUser(user)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusInternalServerError, err.Error()))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(createdUser)
}

// AuthenticateUserHandler returns a handler for authenticating a user
func (h *UserHandler) AuthenticateUserHandler(w http.ResponseWriter, r *http.Request) {
	var creds model.Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusBadRequest, err.Error()))
		return
	}

	user := model.User{Username: creds.Username, Password: creds.Password}
	response, err := h.userService.AuthenticateUser(user)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusUnauthorized, err.Error()))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

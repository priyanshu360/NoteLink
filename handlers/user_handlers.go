package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/priyanshu360/NoteLink/model"
	"github.com/priyanshu360/NoteLink/service"
	"github.com/priyanshu360/NoteLink/utils"
)

type UserHandler struct {
	userService service.UserService
}

func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

func (h *UserHandler) CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	var creds model.Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusBadRequest, err.Error()))
		return
	}

	user := &model.User{Username: creds.Username, Password: creds.Password}
	createdUser, err := h.userService.CreateUser(r.Context(), user)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusInternalServerError, err.Error()))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(createdUser)
}

func (h *UserHandler) AuthenticateUserHandler(w http.ResponseWriter, r *http.Request) {
	var creds model.Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusBadRequest, err.Error()))
		return
	}

	user := model.User{Username: creds.Username, Password: creds.Password}
	response, err := h.userService.AuthenticateUser(r.Context(), user)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusUnauthorized, err.Error()))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/priyanshu360/NoteLink/model"
	"github.com/priyanshu360/NoteLink/service"
	"github.com/priyanshu360/NoteLink/utils"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type NoteHandler struct {
	noteService service.NoteService
	userService service.UserService
}

func NewNoteHandler(noteService service.NoteService, userService service.UserService) *NoteHandler {
	return &NoteHandler{noteService: noteService, userService: userService}
}

func (h *NoteHandler) GetNotesHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromToken(r)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusUnauthorized, "Unauthorized"))
		return
	}

	notes, err := h.noteService.GetAllNotes(r.Context(), userID)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusInternalServerError, err.Error()))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notes)
}

func (h *NoteHandler) GetNoteHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromToken(r)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusUnauthorized, "Unauthorized"))
		return
	}

	params := mux.Vars(r)
	noteID, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusBadRequest, "Invalid note ID"))
		return
	}

	note, err := h.noteService.GetNoteByID(r.Context(), noteID, userID)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusNotFound, err.Error()))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(note)
}

func (h *NoteHandler) CreateNoteHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromToken(r)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusUnauthorized, "Unauthorized"))
		return
	}

	var note model.Note
	if err := json.NewDecoder(r.Body).Decode(&note); err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusBadRequest, err.Error()))
		return
	}

	note.UserID = userID
	err = h.noteService.CreateNote(r.Context(), &note)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusInternalServerError, err.Error()))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(note)
}

func (h *NoteHandler) UpdateNoteHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromToken(r)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusUnauthorized, "Unauthorized"))
		return
	}

	params := mux.Vars(r)
	noteID, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusBadRequest, "Invalid note ID"))
		return
	}

	var updatedNote model.Note
	if err := json.NewDecoder(r.Body).Decode(&updatedNote); err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusBadRequest, err.Error()))
		return
	}

	existingNote, err := h.noteService.GetNoteByID(r.Context(), noteID, userID)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusNotFound, err.Error()))
		return
	}

	existingNote.Title = updatedNote.Title
	existingNote.Content = updatedNote.Content

	err = h.noteService.UpdateNote(r.Context(), existingNote)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusInternalServerError, err.Error()))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(existingNote)
}

func (h *NoteHandler) DeleteNoteHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromToken(r)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusUnauthorized, "Unauthorized"))
		return
	}

	params := mux.Vars(r)
	noteID, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusBadRequest, "Invalid note ID"))
		return
	}

	err = h.noteService.DeleteNote(r.Context(), noteID, userID)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusNotFound, err.Error()))
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *NoteHandler) ShareNoteHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromToken(r)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusUnauthorized, "Unauthorized"))
		return
	}

	params := mux.Vars(r)
	noteID, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusBadRequest, "Invalid note ID"))
		return
	}

	var shareRequest struct {
		TargetUserID string `json:"target_user_id"`
		Username     string `json:"username"`
	}

	if err := json.NewDecoder(r.Body).Decode(&shareRequest); err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusBadRequest, err.Error()))
		return
	}

	var targetUserID primitive.ObjectID

	if shareRequest.Username != "" {
		targetUser, err := h.userService.GetUserByUsername(r.Context(), shareRequest.Username)
		if err != nil {
			utils.WriteJSONError(w, model.NewAPIError(http.StatusNotFound, "Target user not found"))
			return
		}
		targetUserID = targetUser.ID
	} else {
		targetUserID, err = primitive.ObjectIDFromHex(shareRequest.TargetUserID)
		if err != nil {
			utils.WriteJSONError(w, model.NewAPIError(http.StatusBadRequest, "Invalid target user ID"))
			return
		}
	}

	err = h.noteService.ShareNoteWithUser(r.Context(), noteID, userID, targetUserID)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusInternalServerError, err.Error()))
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *NoteHandler) SearchNotesHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromToken(r)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusUnauthorized, "Unauthorized"))
		return
	}

	query := r.URL.Query().Get("q")
	if query == "" {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusBadRequest, "Query parameter 'q' is required"))
		return
	}

	notes, err := h.noteService.SearchNotes(r.Context(), userID, query)
	if err != nil {
		utils.WriteJSONError(w, model.NewAPIError(http.StatusInternalServerError, err.Error()))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notes)
}

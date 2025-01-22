package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/priyanshu360/NoteLink/model"
	"github.com/priyanshu360/NoteLink/service"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// NoteHandler provides HTTP handlers for note-related operations
type NoteHandler struct {
	noteService service.NoteService
}

// NewNoteHandler creates a new instance of NoteHandler
func NewNoteHandler(noteService service.NoteService) *NoteHandler {
	return &NoteHandler{noteService: noteService}
}

// GetNotesHandler returns a handler for getting all notes
func (h *NoteHandler) GetNotesHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	notes, err := h.noteService.GetAllNotes(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notes)
}

// GetNoteHandler returns a handler for getting a single note by ID
func (h *NoteHandler) GetNoteHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	noteID, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		http.Error(w, "Invalid note ID", http.StatusBadRequest)
		return
	}

	note, err := h.noteService.GetNoteByID(noteID, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(note)
}

// CreateNoteHandler returns a handler for creating a new note
func (h *NoteHandler) CreateNoteHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var note model.Note
	if err := json.NewDecoder(r.Body).Decode(&note); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	note.UserID = userID
	err = h.noteService.CreateNote(&note)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// UpdateNoteHandler returns a handler for updating an existing note by ID
func (h *NoteHandler) UpdateNoteHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	noteID, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		http.Error(w, "Invalid note ID", http.StatusBadRequest)
		return
	}

	var updatedNote model.Note
	if err := json.NewDecoder(r.Body).Decode(&updatedNote); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Ensure that the note belongs to the authenticated user
	existingNote, err := h.noteService.GetNoteByID(noteID, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	// Update the existing note
	existingNote.Title = updatedNote.Title
	existingNote.Content = updatedNote.Content

	err = h.noteService.UpdateNote(existingNote)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// DeleteNoteHandler returns a handler for deleting a note by ID
func (h *NoteHandler) DeleteNoteHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	noteID, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		http.Error(w, "Invalid note ID", http.StatusBadRequest)
		return
	}

	err = h.noteService.DeleteNote(noteID, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ShareNoteHandler returns a handler for sharing a note with another user
func (h *NoteHandler) ShareNoteHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	noteID, err := primitive.ObjectIDFromHex(params["id"])
	if err != nil {
		http.Error(w, "Invalid note ID", http.StatusBadRequest)
		return
	}

	var shareRequest struct {
		TargetUserID string `json:"target_user_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&shareRequest); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	targetUserID, err := primitive.ObjectIDFromHex(shareRequest.TargetUserID)
	if err != nil {
		http.Error(w, "Invalid target user ID", http.StatusBadRequest)
		return
	}

	err = h.noteService.ShareNoteWithUser(noteID, userID, targetUserID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// SearchNotesHandler returns a handler for searching notes
func (h *NoteHandler) SearchNotesHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	query := r.URL.Query().Get("q")
	if query == "" {
		http.Error(w, "Query parameter 'q' is required", http.StatusBadRequest)
		return
	}

	notes, err := h.noteService.SearchNotes(userID, query)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notes)
}

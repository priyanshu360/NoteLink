// handler/note.go

package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt"
	"github.com/gorilla/mux"
	"github.com/priyanshu360/NoteLink/model"
	"github.com/priyanshu360/NoteLink/service"
	"gopkg.in/mgo.v2/bson"
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
	noteID := bson.ObjectIdHex(params["id"])

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

	var note model.Note // Assuming service.Note is the same as repository.Note
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
	noteID := bson.ObjectIdHex(params["id"])

	var updatedNote model.Note // Assuming service.Note is the same as repository.Note
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
	noteID := bson.ObjectIdHex(params["id"])

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
	noteID := bson.ObjectIdHex(params["id"])

	var shareRequest struct {
		TargetUserID string `json:"target_user_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&shareRequest); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	targetUserID := bson.ObjectIdHex(shareRequest.TargetUserID)

	err = h.noteService.ShareNoteWithUser(noteID, userID, targetUserID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// Assume you have a constant for the JWT secret key
const jwtSecret = "your-secret-key"

func getUserIDFromToken(r *http.Request) (bson.ObjectId, error) {
	// Extract the Authorization header from the request
	tokenString := r.Header.Get("Authorization")
	if tokenString == "" {
		return "", errors.New("Authorization header missing")
	}

	// Extract the token from the "Bearer" prefix
	tokenString = strings.TrimPrefix(tokenString, "Bearer ")

	// Parse the token
	token, err := jwt.ParseWithClaims(tokenString, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})

	if err != nil {
		return "", err
	}

	// Extract user ID from the token claims
	claims, ok := token.Claims.(*jwt.StandardClaims)
	if !ok {
		return "", errors.New("Invalid token claims")
	}

	userID := bson.ObjectIdHex(claims.Subject)
	return userID, nil
}

// service/note.go
package note

import (
	"time"

	"github.com/priyanshu360/NoteLink/model"
	"github.com/priyanshu360/NoteLink/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// NoteService provides business logic related to notes
type NoteService struct {
	noteStore repository.NoteStore
}

// NewNoteService creates a new instance of NoteService
func NewNoteService(noteStore repository.NoteStore) *NoteService {
	return &NoteService{noteStore: noteStore}
}

// GetAllNotes retrieves all notes for a specific user
func (s *NoteService) GetAllNotes(userID primitive.ObjectID) ([]model.Note, error) {
	return s.noteStore.GetAllNotes(userID)
}

// GetNoteByID retrieves a note by ID for a specific user
func (s *NoteService) GetNoteByID(noteID primitive.ObjectID, userID primitive.ObjectID) (*model.Note, error) {
	return s.noteStore.GetNoteByID(noteID, userID)
}

// CreateNote creates a new note for a specific user
func (s *NoteService) CreateNote(note *model.Note) error {
	note.ID = primitive.NewObjectID()
	note.CreatedAt = time.Now()
	note.UpdatedAt = time.Now()
	return s.noteStore.CreateNote(note)
}

// UpdateNote updates an existing note for a specific user
func (s *NoteService) UpdateNote(note *model.Note) error {
	note.UpdatedAt = time.Now()
	return s.noteStore.UpdateNote(note)
}

// DeleteNote deletes a note by ID for a specific user
func (s *NoteService) DeleteNote(noteID primitive.ObjectID, userID primitive.ObjectID) error {
	return s.noteStore.DeleteNote(noteID, userID)
}

// ShareNoteWithUser shares a note with another user for a specific user
func (s *NoteService) ShareNoteWithUser(noteID primitive.ObjectID, userID primitive.ObjectID, targetUserID primitive.ObjectID) error {
	return s.noteStore.ShareNoteWithUser(noteID, userID, targetUserID)
}

// SearchNotes searches for notes based on keywords for a specific user
func (s *NoteService) SearchNotes(userID primitive.ObjectID, query string) ([]model.Note, error) {
	return s.noteStore.SearchNotes(userID, query)
}

package service

// service/note.go

import (
	"github.com/priyanshu360/NoteLink/model"
	"github.com/priyanshu360/NoteLink/repository"
	"gopkg.in/mgo.v2/bson"
)

// NoteService provides business logic related to notes
type NoteService struct {
	noteStore repository.Store
}

// NewNoteService creates a new instance of NoteService
func NewNoteService(noteStore repository.Store) *NoteService {
	return &NoteService{noteStore: noteStore}
}

// GetAllNotes retrieves all notes for a specific user
func (s *NoteService) GetAllNotes(userID bson.ObjectId) ([]model.Note, error) {
	return s.noteStore.GetAllNotes(userID)
}

// GetNoteByID retrieves a note by ID for a specific user
func (s *NoteService) GetNoteByID(noteID bson.ObjectId, userID bson.ObjectId) (*model.Note, error) {
	return s.noteStore.GetNoteByID(noteID, userID)
}

// CreateNote creates a new note for a specific user
func (s *NoteService) CreateNote(note *model.Note) error {
	return s.noteStore.CreateNote(note)
}

// UpdateNote updates an existing note for a specific user
func (s *NoteService) UpdateNote(note *model.Note) error {
	return s.noteStore.UpdateNote(note)
}

// DeleteNote deletes a note by ID for a specific user
func (s *NoteService) DeleteNote(noteID bson.ObjectId, userID bson.ObjectId) error {
	return s.noteStore.DeleteNote(noteID, userID)
}

// ShareNoteWithUser shares a note with another user for a specific user
func (s *NoteService) ShareNoteWithUser(noteID bson.ObjectId, userID bson.ObjectId, targetUserID bson.ObjectId) error {
	return s.noteStore.ShareNoteWithUser(noteID, userID, targetUserID)
}

// SearchNotes searches for notes based on keywords for a specific user
func (s *NoteService) SearchNotes(userID bson.ObjectId, query string) ([]model.Note, error) {
	return s.noteStore.SearchNotes(userID, query)
}

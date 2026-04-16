package note

import (
	"context"
	"time"

	"github.com/priyanshu360/NoteLink/model"
	"github.com/priyanshu360/NoteLink/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type NoteService struct {
	noteStore repository.NoteStore
}

func NewNoteService(noteStore repository.NoteStore) *NoteService {
	return &NoteService{noteStore: noteStore}
}

func (s *NoteService) GetAllNotes(ctx context.Context, userID primitive.ObjectID) ([]model.Note, error) {
	return s.noteStore.GetAllNotes(ctx, userID)
}

func (s *NoteService) GetNoteByID(ctx context.Context, noteID primitive.ObjectID, userID primitive.ObjectID) (*model.Note, error) {
	return s.noteStore.GetNoteByID(ctx, noteID, userID)
}

func (s *NoteService) CreateNote(ctx context.Context, note *model.Note) error {
	note.ID = primitive.NewObjectID()
	note.CreatedAt = time.Now()
	note.UpdatedAt = time.Now()
	return s.noteStore.CreateNote(ctx, note)
}

func (s *NoteService) UpdateNote(ctx context.Context, note *model.Note) error {
	note.UpdatedAt = time.Now()
	return s.noteStore.UpdateNote(ctx, note)
}

func (s *NoteService) DeleteNote(ctx context.Context, noteID primitive.ObjectID, userID primitive.ObjectID) error {
	return s.noteStore.DeleteNote(ctx, noteID, userID)
}

func (s *NoteService) ShareNoteWithUser(ctx context.Context, noteID primitive.ObjectID, userID primitive.ObjectID, targetUserID primitive.ObjectID) error {
	return s.noteStore.ShareNoteWithUser(ctx, noteID, userID, targetUserID)
}

func (s *NoteService) SearchNotes(ctx context.Context, userID primitive.ObjectID, query string) ([]model.Note, error) {
	return s.noteStore.SearchNotes(ctx, userID, query)
}

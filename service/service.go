package service

import (
	"context"

	"github.com/priyanshu360/NoteLink/model"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type NoteService interface {
	GetAllNotes(ctx context.Context, userID primitive.ObjectID) ([]model.Note, error)
	GetNoteByID(ctx context.Context, noteID primitive.ObjectID, userID primitive.ObjectID) (*model.Note, error)
	CreateNote(ctx context.Context, note *model.Note) error
	UpdateNote(ctx context.Context, note *model.Note) error
	DeleteNote(ctx context.Context, noteID primitive.ObjectID, userID primitive.ObjectID) error
	ShareNoteWithUser(ctx context.Context, noteID primitive.ObjectID, userID primitive.ObjectID, targetUserID primitive.ObjectID) error
	SearchNotes(ctx context.Context, userID primitive.ObjectID, query string) ([]model.Note, error)
}

type UserLoginResponse struct {
	User  *model.User `json:"user"`
	Token string      `json:"token"`
}

type UserService interface {
	CreateUser(ctx context.Context, user *model.User) (*model.User, error)
	AuthenticateUser(ctx context.Context, credentials model.User) (UserLoginResponse, error)
	GetUserByUsername(ctx context.Context, username string) (*model.User, error)
}

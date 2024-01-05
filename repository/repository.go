package repository

import (
	"github.com/priyanshu360/NoteLink/model"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type NoteStore interface {
	GetAllNotes(userID primitive.ObjectID) ([]model.Note, error)
	GetNoteByID(noteID primitive.ObjectID, userID primitive.ObjectID) (*model.Note, error)
	CreateNote(note *model.Note) error
	UpdateNote(note *model.Note) error
	DeleteNote(noteID primitive.ObjectID, userID primitive.ObjectID) error
	ShareNoteWithUser(noteID primitive.ObjectID, userID primitive.ObjectID, targetUserID primitive.ObjectID) error
	SearchNotes(userID primitive.ObjectID, query string) ([]model.Note, error)
}

type UserStore interface {
	CreateUser(user *model.User) (*model.User, error)
	AuthenticateUser(credentials model.User) (*model.User, error)
}

package repository

import (
	"github.com/priyanshu360/NoteLink/model"
	"gopkg.in/mgo.v2/bson"
)

type Store interface {
	GetAllNotes(userID bson.ObjectId) ([]model.Note, error)
	GetNoteByID(noteID bson.ObjectId, userID bson.ObjectId) (*model.Note, error)
	CreateNote(note *model.Note) error
	UpdateNote(note *model.Note) error
	DeleteNote(noteID bson.ObjectId, userID bson.ObjectId) error
	ShareNoteWithUser(noteID bson.ObjectId, userID bson.ObjectId, targetUserID bson.ObjectId) error
	SearchNotes(userID bson.ObjectId, query string) ([]model.Note, error)
}

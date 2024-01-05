package mongo

import (
	"github.com/priyanshu360/NoteLink/model"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type MongoNoteStore struct {
	session        *mgo.Session
	databaseName   string
	collectionName string
}

func NewMongoNoteStore(session *mgo.Session, databaseName, collectionName string) *MongoNoteStore {
	return &MongoNoteStore{
		session:        session,
		databaseName:   databaseName,
		collectionName: collectionName,
	}
}

// GetAllNotes retrieves all notes for a specific user
func (store *MongoNoteStore) GetAllNotes(userID bson.ObjectId) ([]model.Note, error) {
	session := store.session.Clone()
	defer session.Close()

	var notes []model.Note
	err := session.DB(store.databaseName).
		C(store.collectionName).
		Find(bson.M{"user_id": userID}).
		All(&notes)

	if err != nil {
		return nil, err
	}
	return notes, nil
}

// GetNoteByID retrieves a note by ID for a specific user
func (store *MongoNoteStore) GetNoteByID(noteID bson.ObjectId, userID bson.ObjectId) (*model.Note, error) {
	session := store.session.Clone()
	defer session.Close()

	var note model.Note
	err := session.DB(store.databaseName).
		C(store.collectionName).
		Find(bson.M{"_id": noteID, "user_id": userID}).
		One(&note)

	if err != nil {
		return nil, err
	}
	return &note, nil
}

// CreateNote creates a new note for a specific user
func (store *MongoNoteStore) CreateNote(note *model.Note) error {
	session := store.session.Clone()
	defer session.Close()

	err := session.DB(store.databaseName).
		C(store.collectionName).
		Insert(note)

	return err
}

// UpdateNote updates an existing note for a specific user
func (store *MongoNoteStore) UpdateNote(note *model.Note) error {
	session := store.session.Clone()
	defer session.Close()

	err := session.DB(store.databaseName).
		C(store.collectionName).
		Update(bson.M{"_id": note.ID, "user_id": note.UserID}, note)

	return err
}

// DeleteNote deletes a note by ID for a specific user
func (store *MongoNoteStore) DeleteNote(noteID bson.ObjectId, userID bson.ObjectId) error {
	session := store.session.Clone()
	defer session.Close()

	err := session.DB(store.databaseName).
		C(store.collectionName).
		Remove(bson.M{"_id": noteID, "user_id": userID})

	return err
}

// ShareNoteWithUser shares a note with another user for a specific user
func (store *MongoNoteStore) ShareNoteWithUser(noteID bson.ObjectId, userID bson.ObjectId, targetUserID bson.ObjectId) error {
	session := store.session.Clone()
	defer session.Close()

	// Check if the note exists and belongs to the user
	var note model.Note
	err := session.DB(store.databaseName).
		C(store.collectionName).
		Find(bson.M{"_id": noteID, "user_id": userID}).
		One(&note)

	if err != nil {
		return err
	}

	// Update the note to be shared and associate it with the target user
	note.Shared = true
	note.UserID = targetUserID
	note.ID = bson.NewObjectId()

	err = session.DB(store.databaseName).
		C(store.collectionName).
		Insert(note)

	return err
}

// SearchNotes searches for notes based on keywords for a specific user
func (store *MongoNoteStore) SearchNotes(userID bson.ObjectId, query string) ([]model.Note, error) {
	session := store.session.Clone()
	defer session.Close()

	var notes []model.Note
	err := session.DB(store.databaseName).
		C(store.collectionName).
		Find(bson.M{"user_id": userID, "$text": bson.M{"$search": query}}).
		All(&notes)

	if err != nil {
		return nil, err
	}
	return notes, nil
}

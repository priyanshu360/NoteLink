package mongo

import (
	"context"

	"github.com/priyanshu360/NoteLink/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type MongoNoteStore struct {
	client         *mongo.Client
	databaseName   string
	collectionName string
}

func NewMongoNoteStore(client *mongo.Client, databaseName, collectionName string) *MongoNoteStore {
	return &MongoNoteStore{
		client:         client,
		databaseName:   databaseName,
		collectionName: collectionName,
	}
}

// GetAllNotes retrieves all notes for a specific user
func (store *MongoNoteStore) GetAllNotes(userID primitive.ObjectID) ([]model.Note, error) {
	collection := store.client.Database(store.databaseName).Collection(store.collectionName)
	ctx := context.TODO()

	var notes []model.Note
	cursor, err := collection.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	err = cursor.All(ctx, &notes)
	if err != nil {
		return nil, err
	}

	return notes, nil
}

// GetNoteByID retrieves a note by ID for a specific user
func (store *MongoNoteStore) GetNoteByID(noteID primitive.ObjectID, userID primitive.ObjectID) (*model.Note, error) {
	collection := store.client.Database(store.databaseName).Collection(store.collectionName)
	ctx := context.TODO()

	var note model.Note
	err := collection.FindOne(ctx, bson.M{"_id": noteID, "user_id": userID}).Decode(&note)
	if err != nil {
		return nil, err
	}

	return &note, nil
}

// CreateNote creates a new note for a specific user
func (store *MongoNoteStore) CreateNote(note *model.Note) error {
	collection := store.client.Database(store.databaseName).Collection(store.collectionName)
	ctx := context.TODO()

	_, err := collection.InsertOne(ctx, note)
	return err
}

// UpdateNote updates an existing note for a specific user
func (store *MongoNoteStore) UpdateNote(note *model.Note) error {
	collection := store.client.Database(store.databaseName).Collection(store.collectionName)
	ctx := context.TODO()

	_, err := collection.UpdateOne(ctx,
		bson.M{"_id": note.ID, "user_id": note.UserID},
		bson.M{"$set": note},
	)
	return err
}

// DeleteNote deletes a note by ID for a specific user
func (store *MongoNoteStore) DeleteNote(noteID primitive.ObjectID, userID primitive.ObjectID) error {
	collection := store.client.Database(store.databaseName).Collection(store.collectionName)
	ctx := context.TODO()

	_, err := collection.DeleteOne(ctx, bson.M{"_id": noteID, "user_id": userID})
	return err
}

// ShareNoteWithUser shares a note with another user for a specific user
func (store *MongoNoteStore) ShareNoteWithUser(noteID primitive.ObjectID, userID primitive.ObjectID, targetUserID primitive.ObjectID) error {
	collection := store.client.Database(store.databaseName).Collection(store.collectionName)
	ctx := context.TODO()

	// Check if the note exists and belongs to the user
	var note model.Note
	err := collection.FindOne(ctx, bson.M{"_id": noteID, "user_id": userID}).Decode(&note)
	if err != nil {
		return err
	}

	// Update the note to be shared and associate it with the target user
	note.Shared = true
	note.UserID = targetUserID
	note.ID = primitive.NewObjectID()

	_, err = collection.InsertOne(ctx, note)
	return err
}

// SearchNotes searches for notes based on keywords for a specific user
func (store *MongoNoteStore) SearchNotes(userID primitive.ObjectID, query string) ([]model.Note, error) {
	collection := store.client.Database(store.databaseName).Collection(store.collectionName)
	ctx := context.TODO()

	var notes []model.Note
	filter := bson.M{"user_id": userID, "$text": bson.M{"$search": query}}
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	err = cursor.All(ctx, &notes)
	if err != nil {
		return nil, err
	}

	return notes, nil
}

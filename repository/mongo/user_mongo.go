package mongo

import (
	"context"
	"errors"

	"github.com/priyanshu360/NoteLink/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

// MongoUserRepository implements UserRepository for MongoDB
type MongoUserRepository struct {
	client         *mongo.Client
	databaseName   string
	collectionName string
}

// NewMongoUserRepository creates a new instance of MongoUserRepository
func NewMongoUserRepository(client *mongo.Client, databaseName, collectionName string) *MongoUserRepository {
	return &MongoUserRepository{
		client:         client,
		databaseName:   databaseName,
		collectionName: collectionName,
	}
}

// GetUserByUsername finds a user by username
func (repo *MongoUserRepository) GetUserByUsername(ctx context.Context, username string) (*model.User, error) {
	collection := repo.client.Database(repo.databaseName).Collection(repo.collectionName)

	var user model.User
	err := collection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return &user, nil
}

// CreateUser creates a new user in the database
func (repo *MongoUserRepository) CreateUser(ctx context.Context, user *model.User) (*model.User, error) {
	collection := repo.client.Database(repo.databaseName).Collection(repo.collectionName)

	user.ID = primitive.NewObjectID()

	_, err := collection.InsertOne(ctx, user)
	if err != nil {
		return nil, err
	}

	user.Password = ""
	return user, nil
}

// AuthenticateUser authenticates a user based on provided credentials
func (repo *MongoUserRepository) AuthenticateUser(ctx context.Context, credentials model.User) (*model.User, error) {
	collection := repo.client.Database(repo.databaseName).Collection(repo.collectionName)

	var user model.User
	filter := bson.M{"username": credentials.Username}
	err := collection.FindOne(ctx, filter).Decode(&user)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errors.New("invalid credentials")
		}
		return nil, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(credentials.Password))
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	user.Password = ""
	return &user, nil
}

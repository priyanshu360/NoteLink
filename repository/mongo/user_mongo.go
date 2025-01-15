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

// CreateUser creates a new user in the database
func (repo *MongoUserRepository) CreateUser(user *model.User) (*model.User, error) {
	collection := repo.client.Database(repo.databaseName).Collection(repo.collectionName)

	user.ID = primitive.NewObjectID()

	// Hash password before storing
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	user.Password = string(hashedPassword)

	_, err = collection.InsertOne(context.TODO(), user)
	if err != nil {
		return nil, err
	}

	// Clear password from response
	user.Password = ""
	return user, nil
}

// AuthenticateUser authenticates a user based on provided credentials
func (repo *MongoUserRepository) AuthenticateUser(credentials model.User) (*model.User, error) {
	collection := repo.client.Database(repo.databaseName).Collection(repo.collectionName)

	var user model.User
	filter := bson.M{"username": credentials.Username}
	err := collection.FindOne(context.TODO(), filter).Decode(&user)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			// User not found
			return nil, errors.New("invalid credentials")
		}
		return nil, err
	}

	// Compare passwords
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(credentials.Password))
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Clear password from response
	user.Password = ""
	return &user, nil
}

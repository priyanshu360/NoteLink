package user

import (
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/priyanshu360/NoteLink/model"
	"github.com/priyanshu360/NoteLink/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type UserServiceImpl struct {
	userRepo repository.UserStore
}

// NewUserService creates a new instance of UserServiceImpl
func NewUserService(userRepo repository.UserStore) *UserServiceImpl {
	return &UserServiceImpl{
		userRepo: userRepo,
	}
}

// CreateUser creates a new user
func (s *UserServiceImpl) CreateUser(user *model.User) (*model.User, error) {
	// Hash password before creating user
	hashedPassword, err := s.HashPassword(user.Password)
	if err != nil {
		return nil, err
	}
	user.Password = hashedPassword

	return s.userRepo.CreateUser(user)
}

// AuthenticateUser authenticates a user based on provided credentials
func (s *UserServiceImpl) AuthenticateUser(credentials model.User) (*model.User, error) {
	user, err := s.userRepo.AuthenticateUser(credentials)
	if err != nil {
		return nil, err
	}

	// Generate JWT token
	token, err := s.generateJWTToken(user.ID)
	if err != nil {
		return nil, err
	}

	user.Password = token // Store token in password field temporarily for response
	return user, nil
}

// HashPassword hashes a password using bcrypt
func (s *UserServiceImpl) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash compares a password with its hash
func (s *UserServiceImpl) CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// generateJWTToken generates a JWT token for the user
func (s *UserServiceImpl) generateJWTToken(userID primitive.ObjectID) (string, error) {
	claims := &jwt.StandardClaims{
		Subject:   userID.Hex(),
		ExpiresAt: time.Now().Add(time.Hour * 24).Unix(),
		IssuedAt:  time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte("your-secret-key"))
}

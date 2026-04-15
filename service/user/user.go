package user

import (
	"context"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/priyanshu360/NoteLink/model"
	"github.com/priyanshu360/NoteLink/repository"
	"github.com/priyanshu360/NoteLink/service"
	"github.com/priyanshu360/NoteLink/utils"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type UserLoginResponse struct {
	User  *model.User `json:"user"`
	Token string      `json:"token"`
}

type UserServiceImpl struct {
	userRepo repository.UserStore
}

func NewUserService(userRepo repository.UserStore) *UserServiceImpl {
	return &UserServiceImpl{
		userRepo: userRepo,
	}
}

func (s *UserServiceImpl) CreateUser(ctx context.Context, user *model.User) (*model.User, error) {
	hashedPassword, err := s.HashPassword(user.Password)
	if err != nil {
		return nil, err
	}
	user.Password = hashedPassword

	return s.userRepo.CreateUser(ctx, user)
}

func (s *UserServiceImpl) AuthenticateUser(ctx context.Context, credentials model.User) (service.UserLoginResponse, error) {
	user, err := s.userRepo.AuthenticateUser(ctx, credentials)
	if err != nil {
		return service.UserLoginResponse{
			User:  nil,
			Token: "",
		}, err
	}

	token, err := s.generateJWTToken(user.ID)
	if err != nil {
		return service.UserLoginResponse{
			User:  nil,
			Token: "",
		}, err
	}

	user.Password = ""

	response := service.UserLoginResponse{
		User:  user,
		Token: token,
	}

	return response, nil
}

func (s *UserServiceImpl) GetUserByUsername(ctx context.Context, username string) (*model.User, error) {
	return s.userRepo.GetUserByUsername(ctx, username)
}

func (s *UserServiceImpl) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func (s *UserServiceImpl) CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func (s *UserServiceImpl) generateJWTToken(userID primitive.ObjectID) (string, error) {
	claims := &jwt.StandardClaims{
		Subject:   userID.Hex(),
		ExpiresAt: time.Now().Add(time.Hour * 24).Unix(),
		IssuedAt:  time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(utils.GetJWTSecret()))
}

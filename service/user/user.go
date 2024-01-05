package user

import (
	"github.com/priyanshu360/NoteLink/model"
	"github.com/priyanshu360/NoteLink/repository"
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
	return s.userRepo.CreateUser(user)
}

// AuthenticateUser authenticates a user based on provided credentials
func (s *UserServiceImpl) AuthenticateUser(credentials model.User) (*model.User, error) {
	return s.userRepo.AuthenticateUser(credentials)
}

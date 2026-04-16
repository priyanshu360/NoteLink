package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/priyanshu360/NoteLink/model"
	"github.com/priyanshu360/NoteLink/service/user"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MockUserStore struct {
	users []model.User
}

func (m *MockUserStore) CreateUser(ctx context.Context, usr *model.User) (*model.User, error) {
	usr.ID = primitive.NewObjectID()
	usr.Password = ""
	m.users = append(m.users, *usr)
	return usr, nil
}

func (m *MockUserStore) AuthenticateUser(ctx context.Context, credentials model.User) (*model.User, error) {
	for _, u := range m.users {
		if u.Username == credentials.Username {
			u.Password = ""
			return &u, nil
		}
	}
	return nil, errors.New("invalid credentials")
}

func (m *MockUserStore) GetUserByUsername(ctx context.Context, username string) (*model.User, error) {
	for _, u := range m.users {
		if u.Username == username {
			return &u, nil
		}
	}
	return nil, errors.New("user not found")
}

func TestCreateUserHandler(t *testing.T) {
	t.Run("Valid_user_creation", func(t *testing.T) {
		mockStore := &MockUserStore{}
		userService := user.NewUserService(mockStore)
		handler := NewUserHandler(userService)

		userData := map[string]interface{}{
			"username": "testuser",
			"password": "password123",
		}

		var body bytes.Buffer
		if err := json.NewEncoder(&body).Encode(userData); err != nil {
			t.Fatal(err)
		}

		req := httptest.NewRequest(http.MethodPost, "/api/auth/signup", &body)
		w := httptest.NewRecorder()

		handler.CreateUserHandler(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("Invalid_JSON", func(t *testing.T) {
		mockStore := &MockUserStore{}
		userService := user.NewUserService(mockStore)
		handler := NewUserHandler(userService)

		req := httptest.NewRequest(http.MethodPost, "/api/auth/signup", bytes.NewBufferString("invalid json"))
		w := httptest.NewRecorder()

		handler.CreateUserHandler(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

}

func TestAuthenticateUserHandler(t *testing.T) {
	t.Run("Valid_authentication", func(t *testing.T) {
		mockStore := &MockUserStore{}
		testUser := model.User{
			ID:       primitive.NewObjectID(),
			Username: "testuser",
			Password: "hashedpassword",
		}
		mockStore.users = []model.User{testUser}

		userService := user.NewUserService(mockStore)
		handler := NewUserHandler(userService)

		credentials := map[string]interface{}{
			"username": "testuser",
			"password": "password123",
		}

		var body bytes.Buffer
		if err := json.NewEncoder(&body).Encode(credentials); err != nil {
			t.Fatal(err)
		}

		req := httptest.NewRequest(http.MethodPost, "/api/auth/login", &body)
		w := httptest.NewRecorder()

		handler.AuthenticateUserHandler(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err := json.NewDecoder(w.Body).Decode(&response)
		if err != nil {
			t.Fatal(err)
		}

		assert.Contains(t, response, "user")
		assert.Contains(t, response, "token")
	})

	t.Run("Invalid_credentials", func(t *testing.T) {
		mockStore := &MockUserStore{}
		userService := user.NewUserService(mockStore)
		handler := NewUserHandler(userService)

		credentials := map[string]interface{}{
			"username": "nonexistent",
			"password": "wrongpassword",
		}

		var body bytes.Buffer
		if err := json.NewEncoder(&body).Encode(credentials); err != nil {
			t.Fatal(err)
		}

		req := httptest.NewRequest(http.MethodPost, "/api/auth/login", &body)
		w := httptest.NewRecorder()

		handler.AuthenticateUserHandler(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("Invalid_JSON", func(t *testing.T) {
		mockStore := &MockUserStore{}
		userService := user.NewUserService(mockStore)
		handler := NewUserHandler(userService)

		req := httptest.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBufferString("invalid json"))
		w := httptest.NewRecorder()

		handler.AuthenticateUserHandler(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

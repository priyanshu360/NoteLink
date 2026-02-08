package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/priyanshu360/NoteLink/model"
	"github.com/priyanshu360/NoteLink/service"
	"github.com/priyanshu360/NoteLink/service/user"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// MockUserStore for testing
type MockUserStore struct {
	users []model.User
}

func (m *MockUserStore) CreateUser(user *model.User) (*model.User, error) {
	user.ID = primitive.NewObjectID()
	user.Password = "" // Clear password for response
	m.users = append(m.users, *user)
	return user, nil
}

func (m *MockUserStore) AuthenticateUser(credentials model.User) (*model.User, error) {
	for _, user := range m.users {
		if user.Username == credentials.Username {
			user.Password = "" // Clear password for response
			return &user, nil
		}
	}
	return nil, &model.User{Username: "user"}
}

func TestCreateUserHandler(t *testing.T) {
	// Test case 1: Valid user creation
	t.Run("Valid_user_creation", func(t *testing.T) {
		mockStore := &MockUserStore{}
		handler := NewUserHandler(mockStore)

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

	// Test case 2: Invalid JSON
	t.Run("Invalid_JSON", func(t *testing.T) {
		mockStore := &MockUserStore{}
		handler := NewUserHandler(mockStore)

		req := httptest.NewRequest(http.MethodPost, "/api/auth/signup", bytes.NewBufferString("invalid json"))
		w := httptest.NewRecorder()

		handler.CreateUserHandler(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	// Test case 3: Missing username
	t.Run("Missing_username", func(t *testing.T) {
		mockStore := &MockUserStore{}
		handler := NewUserHandler(mockStore)

		userData := map[string]interface{}{
			"password": "password123",
		}

		var body bytes.Buffer
		if err := json.NewEncoder(&body).Encode(userData); err != nil {
			t.Fatal(err)
		}

		req := httptest.NewRequest(http.MethodPost, "/api/auth/signup", &body)
		w := httptest.NewRecorder()

		handler.CreateUserHandler(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)
	})

	// Test case 4: Missing password
	t.Run("Missing_password", func(t *testing.T) {
		mockStore := &MockUserStore{}
		handler := NewUserHandler(mockStore)

		userData := map[string]interface{}{
			"username": "testuser",
		}

		var body bytes.Buffer
		if err := json.NewEncoder(&body).Encode(userData); err != nil {
			t.Fatal(err)
		}

		req := httptest.NewRequest(http.MethodPost, "/api/auth/signup", &body)
		w := httptest.NewRecorder()

		handler.CreateUserHandler(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)
	})
}

func TestAuthenticateUserHandler(t *testing.T) {
	// Test case 1: Valid authentication
	t.Run("Valid_authentication", func(t *testing.T) {
		mockStore := &MockUserStore{}
		// Pre-add a user for authentication
		user := model.User{
			ID:       primitive.NewObjectID(),
			Username: "testuser",
			Password: "hashedpassword",
		}
		mockStore.users = []model.User{user}

		handler := NewUserHandler(mockStore)

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

	// Test case 2: Invalid credentials
	t.Run("Invalid_credentials", func(t *testing.T) {
		mockStore := &MockUserStore{}
		handler := NewUserHandler(mockStore)

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

	// Test case 3: Invalid JSON
	t.Run("Invalid_JSON", func(t *testing.T) {
		mockStore := &MockUserStore{}
		handler := NewUserHandler(mockStore)

		req := httptest.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBufferString("invalid json"))
		w := httptest.NewRecorder()

		handler.AuthenticateUserHandler(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

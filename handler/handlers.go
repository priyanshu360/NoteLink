// handlers.go

package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/priyanshu360/NoteLink/model"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type NoteStore interface {
	GetAllNotes(userID bson.ObjectId) ([]model.Note, error)
	GetNoteByID(noteID bson.ObjectId, userID bson.ObjectId) (*model.Note, error)
	CreateNote(note *model.Note) error
	UpdateNote(note *model.Note) error
	DeleteNote(noteID bson.ObjectId, userID bson.ObjectId) error
	ShareNoteWithUser(noteID bson.ObjectId, userID bson.ObjectId, targetUserID bson.ObjectId) error
	SearchNotes(userID bson.ObjectId, query string) ([]model.Note, error)
}

// MongoNoteStore is a MongoDB implementation of NoteStore
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

// ... Implement other handlers and functions ...

// Create a new user account
func SignupHandler(w http.ResponseWriter, r *http.Request) {
	var user model.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Hash the password before storing it
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}
	user.Password = string(hashedPassword)

	// Save the user to the database
	session := getSession(r)
	defer session.Close()

	user.ID = bson.NewObjectId()
	err = session.DB(databaseName).C("users").Insert(user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return success
	w.WriteHeader(http.StatusCreated)
}

// Log in to an existing user account and receive an access token
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var credentials struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	session := getSession(r)
	defer session.Close()

	var user User
	err := session.DB(databaseName).C("users").
		Find(bson.M{"username": credentials.Username}).One(&user)

	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Compare the hashed password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(credentials.Password)); err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Generate and return JWT token
	token, err := generateToken(user.ID.Hex())
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}

// Get a list of all notes for the authenticated user
func GetNotesHandler(noteStore NoteStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, err := getUserIDFromToken(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		notes, err := noteStore.GetAllNotes(userID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(notes)
	}
}

// Get a note by ID for the authenticated user
func GetNoteHandler(noteStore NoteStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, err := getUserIDFromToken(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		params := mux.Vars(r)
		noteID := bson.ObjectIdHex(params["id"])

		note, err := noteStore.GetNoteByID(noteID, userID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(note)
	}
}

// Create a new note for the authenticated user
func CreateNoteHandler(noteStore NoteStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, err := getUserIDFromToken(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var note Note
		if err := json.NewDecoder(r.Body).Decode(&note); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		note.UserID = userID
		note.CreatedAt = time.Now()
		note.UpdatedAt = time.Now()

		err = noteStore.CreateNote(&note)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

// Update an existing note by ID for the authenticated user
func UpdateNoteHandler(noteStore NoteStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, err := getUserIDFromToken(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		params := mux.Vars(r)
		noteID := bson.ObjectIdHex(params["id"])

		var updatedNote Note
		if err := json.NewDecoder(r.Body).Decode(&updatedNote); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Ensure that the note belongs to the authenticated user
		existingNote, err := noteStore.GetNoteByID(noteID, userID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}

		// Update the existing note
		existingNote.Title = updatedNote.Title
		existingNote.Content = updatedNote.Content
		existingNote.UpdatedAt = time.Now()

		err = noteStore.UpdateNote(existingNote)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

// Delete a note by ID for the authenticated user
func DeleteNoteHandler(noteStore NoteStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, err := getUserIDFromToken(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		params := mux.Vars(r)
		noteID := bson.ObjectIdHex(params["id"])

		err = noteStore.DeleteNote(noteID, userID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

// Share a note with another user for the authenticated user
func ShareNoteHandler(noteStore NoteStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, err := getUserIDFromToken(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		params := mux.Vars(r)
		noteID := bson.ObjectIdHex(params["id"])

		var shareRequest struct {
			TargetUserID string `json:"target_user_id"`
		}

		if err := json.NewDecoder(r.Body).Decode(&shareRequest); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		targetUserID := bson.ObjectIdHex(shareRequest.TargetUserID)

		err = noteStore.ShareNoteWithUser(noteID, userID, targetUserID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

// Search for notes based on keywords for the authenticated user
func SearchNotesHandler(noteStore NoteStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, err := getUserIDFromToken(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		query := r.URL.Query().Get("q")

		notes, err := noteStore.SearchNotes(userID, query)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(notes)
	}
}

// ... Implement other helper functions ...

// getSession returns a new MongoDB session
func getSession(r *http.Request) *mgo.Session {
	session := r.Context().Value("session").(*mgo.Session)
	return session.Clone()
}

// generateToken creates a new JWT token
func generateToken(userID string) (string, error) {
	// Implement your JWT token generation logic here
	// You may use libraries like github.com/dgrijalva/jwt-go
	// Example:
	// token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
	//   "user_id": userID,
	//   "exp":     time.Now().Add(time.Hour * 24).Unix(),
	// })
	// return token.SignedString([]byte("your-secret-key"))
	return "", nil
}

// getUserIDFromToken extracts the user ID from the JWT token
func getUserIDFromToken(r *http.Request) (bson.ObjectId, error) {
	// Implement your JWT token verification and extraction logic here
	// You may use libraries like github.com/dgrijalva/jwt-go
	// Example:
	// tokenString := ExtractToken(r)
	// token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
	//   return []byte("your-secret-key"), nil
	// })
	// if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
	//   userID := claims["user_id"].(string)
	//   return bson.ObjectIdHex(userID), nil
	// }
	// return "", errors.New("Invalid token")
	return "", nil
}

// ExtractToken extracts the JWT token from the request
func ExtractToken(r *http.Request) string {
	// Implement logic to extract the token from the request headers, cookies, etc.
	// Example:
	// tokenString := r.Header.Get("Authorization")
	// if strings.HasPrefix(tokenString, "Bearer ") {
	//   return strings.TrimPrefix(tokenString, "Bearer ")
	// }
	// return ""
	return ""
}

// VerifyToken verifies the JWT token
func VerifyToken(token string) bool {
	// Implement your JWT token verification logic here
	// You may use libraries like github.com/dgrijalva/jwt-go
	// Example:
	// _, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
	//   return []byte("your-secret-key"), nil
	// })
	// return err == nil
	return true
}

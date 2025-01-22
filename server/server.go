package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	"github.com/priyanshu360/NoteLink/config"
	"github.com/priyanshu360/NoteLink/handlers"
	"github.com/priyanshu360/NoteLink/repository"
	"github.com/priyanshu360/NoteLink/repository/mongo"
	"github.com/priyanshu360/NoteLink/service/note"
	"github.com/priyanshu360/NoteLink/service/user"
	mgo "go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/time/rate"
)

var rateLimit = rate.NewLimiter(2, 5)

type APIServer struct {
	httpServer  *http.Server
	middlewares []mux.MiddlewareFunc
	router      *mux.Router
	// rbac        map[http.Handler]models.AccessLevelModeEnum
}

func NewServer(cfg config.ServerConfig) *APIServer {
	return &APIServer{
		httpServer: &http.Server{
			Addr:         fmt.Sprintf("%s:%s", cfg.GetAddress(), cfg.GetPort()),
			WriteTimeout: time.Duration(cfg.GetWriteTimeout()) * time.Second,
			ReadTimeout:  time.Duration(cfg.GetReadTimeout()) * time.Second,
		},
		middlewares: []mux.MiddlewareFunc{},
		router:      mux.NewRouter(),
		// rbac:        make(map[http.Handler]models.AccessLevelModeEnum),
	}
}

func initStore() repository.NoteStore {
	mongoURL := "mongodb://localhost:27017"
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	dbName := "testdb"
	collectionName := "notes"

	client, err := mgo.Connect(ctx, options.Client().ApplyURI(mongoURL))
	if err != nil {
		log.Fatal("Error connecting to MongoDB: ", err)
	}

	// Ensure the client is connected
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Error pinging MongoDB: ", err)
	}

	return mongo.NewMongoNoteStore(client, dbName, collectionName)
}

func initUserStore() repository.UserStore {
	mongoURL := "mongodb://localhost:27017"
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	dbName := "testdb"
	collectionName := "notes"

	client, err := mgo.Connect(ctx, options.Client().ApplyURI(mongoURL))
	if err != nil {
		log.Fatal("Error connecting to MongoDB: ", err)
	}

	// Ensure the client is connected
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Error pinging MongoDB: ", err)
	}

	return mongo.NewMongoUserRepository(client, dbName, collectionName)
}

func (s *APIServer) initRoutesAndMiddleware() {
	// Use AuthMiddleware for all routes
	// s.router.Use(AuthMiddleware)

	// Create a new instance of your note handler, assuming you have one

	noteStore := initStore()
	noteService := note.NewNoteService(noteStore)
	noteHandler := handlers.NewNoteHandler(noteService)

	// Define routes and associate them with the corresponding handler methods
	s.router.HandleFunc("/api/notes", noteHandler.GetNotesHandler).Methods("GET")
	s.router.HandleFunc("/api/notes/{id}", noteHandler.GetNoteHandler).Methods("GET")
	s.router.HandleFunc("/api/notes", noteHandler.CreateNoteHandler).Methods("POST")
	s.router.HandleFunc("/api/notes/{id}", noteHandler.UpdateNoteHandler).Methods("PUT")
	s.router.HandleFunc("/api/notes/{id}", noteHandler.DeleteNoteHandler).Methods("DELETE")
	s.router.HandleFunc("/api/notes/{id}/share", noteHandler.ShareNoteHandler).Methods("POST")

	// Search endpoint for notes
	s.router.HandleFunc("/api/search", noteHandler.SearchNotesHandler).Methods("GET")

	userStore := initUserStore()
	userService := user.NewUserService(userStore)
	userHandler := handlers.NewUserHandler(userService)

	s.router.HandleFunc("/api/auth/signup", userHandler.CreateUserHandler).Methods("POST")
	s.router.HandleFunc("/api/auth/login", userHandler.AuthenticateUserHandler).Methods("POST")

	s.httpServer.Handler = s.router
}

func RateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !rateLimit.Allow() {
			http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// // AuthMiddleware is a middleware to handle user authentication using JWT
// func AuthMiddleware(next http.Handler) http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		token, err := ExtractToken(r)
// 		if err != nil {
// 			http.Error(w, "Unauthorized", http.StatusUnauthorized)
// 			return
// 		}

// 		if !VerifyToken(token) {
// 			http.Error(w, "Unauthorized", http.StatusUnauthorized)
// 			return
// 		}

// 		next.ServeHTTP(w, r)
// 	})
//

func (s *APIServer) run() {
	go func() {
		if err := s.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Println("Error starting server:", err)
			os.Exit(1)
		}
	}()

	log.Println("[*] Server running .... ")

	// Handle graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	sig := <-sigChan
	fmt.Println("Received signal:", sig)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := s.httpServer.Shutdown(ctx); err != nil {
		fmt.Println("Error during server shutdown:", err)
	}
	fmt.Println("Server gracefully stopped")
}

func StartHttpServer(cfg config.ServerConfig) {
	server := NewServer(cfg)
	server.initRoutesAndMiddleware()
	server.run()
}

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
	"github.com/priyanshu360/NoteLink/model"
	"github.com/priyanshu360/NoteLink/repository"
	"github.com/priyanshu360/NoteLink/repository/mongo"
	"github.com/priyanshu360/NoteLink/service/note"
	"github.com/priyanshu360/NoteLink/service/user"
	"github.com/priyanshu360/NoteLink/utils"
	mgo "go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/time/rate"
)

var rateLimit = rate.NewLimiter(2, 5)

type APIServer struct {
	httpServer  *http.Server
	middlewares []mux.MiddlewareFunc
	router      *mux.Router
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
	}
}

func connectMongo() (*mgo.Client, string) {
	mongoURL := os.Getenv("MONGODB_URL")
	if mongoURL == "" {
		mongoURL = "mongodb://localhost:27017"
	}

	dbName := os.Getenv("DATABASE_NAME")
	if dbName == "" {
		dbName = "testdb"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mgo.Connect(ctx, options.Client().ApplyURI(mongoURL))
	if err != nil {
		log.Fatal("Error connecting to MongoDB: ", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Error pinging MongoDB: ", err)
	}

	return client, dbName
}

func (s *APIServer) initRoutesAndMiddleware() {
	s.router.Use(RateLimitMiddleware)

	client, dbName := connectMongo()

	initUserStore := func() repository.UserStore {
		return mongo.NewMongoUserRepository(client, dbName, "users")
	}
	initNoteStore := func() repository.NoteStore {
		return mongo.NewMongoNoteStore(client, dbName, "notes")
	}

	userStore := initUserStore()
	userService := user.NewUserService(userStore)
	userHandler := handlers.NewUserHandler(userService)

	s.router.HandleFunc("/api/auth/signup", userHandler.CreateUserHandler).Methods("POST")
	s.router.HandleFunc("/api/auth/login", userHandler.AuthenticateUserHandler).Methods("POST")

	protectedRouter := s.router.PathPrefix("/api").Subrouter()
	protectedRouter.Use(AuthMiddleware)

	noteStore := initNoteStore()
	noteService := note.NewNoteService(noteStore)
	noteHandler := handlers.NewNoteHandler(noteService, userService)

	protectedRouter.HandleFunc("/notes", noteHandler.GetNotesHandler).Methods("GET")
	protectedRouter.HandleFunc("/notes/{id}", noteHandler.GetNoteHandler).Methods("GET")
	protectedRouter.HandleFunc("/notes", noteHandler.CreateNoteHandler).Methods("POST")
	protectedRouter.HandleFunc("/notes/{id}", noteHandler.UpdateNoteHandler).Methods("PUT")
	protectedRouter.HandleFunc("/notes/{id}", noteHandler.DeleteNoteHandler).Methods("DELETE")
	protectedRouter.HandleFunc("/notes/{id}/share", noteHandler.ShareNoteHandler).Methods("POST")
	protectedRouter.HandleFunc("/search", noteHandler.SearchNotesHandler).Methods("GET")

	s.httpServer.Handler = s.router
}

func RateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !rateLimit.Allow() {
			utils.WriteJSONError(w, model.NewAPIError(http.StatusTooManyRequests, "Rate limit exceeded"))
			return
		}
		next.ServeHTTP(w, r)
	})
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.Header.Get("Authorization")
		if tokenString == "" {
			utils.WriteJSONError(w, model.NewAPIError(http.StatusUnauthorized, "Unauthorized"))
			return
		}

		_, err := utils.ValidateJWT(tokenString)
		if err != nil {
			utils.WriteJSONError(w, model.NewAPIError(http.StatusUnauthorized, "Unauthorized"))
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (s *APIServer) run() {
	go func() {
		if err := s.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Println("Error starting server:", err)
			os.Exit(1)
		}
	}()

	log.Println("[*] Server running .... ")

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

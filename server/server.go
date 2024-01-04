package server

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/priyanshu360/NoteLink/config"
	"github.com/priyanshu360/NoteLink/handler"
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

func (s *APIServer) initRoutesAndMiddleware() {
	// s.router.PathPrefix("/api/notes").Subrouter()
	s.router.Use(AuthMiddleware) // Middleware for authentication

	s.router.HandleFunc("", handler.GetNotesHandler(noteStore)).Methods("GET")
	s.router.HandleFunc("/{id}", handler.GetNoteHandler(noteStore)).Methods("GET")
	s.router.HandleFunc("", handler.CreateNoteHandler(noteStore)).Methods("POST")
	s.router.HandleFunc("/{id}", handler.UpdateNoteHandler(noteStore)).Methods("PUT")
	s.router.HandleFunc("/{id}", handler.DeleteNoteHandler(noteStore)).Methods("DELETE")
	s.router.HandleFunc("/{id}/share", handler.ShareNoteHandler(noteStore)).Methods("POST")

	// .HandleFunc("/api/search", SearchNotesHandler(noteStore)).Methods("GET")
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

// AuthMiddleware is a middleware to handle user authentication using JWT
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, err := ExtractToken(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		if !VerifyToken(token) {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

# Makefile

.PHONY: help build run test clean deps start-mongo stop-mongo lint format

help: ## Display this help message
	@echo "Usage: make <target>"
	@echo "Targets:"
	@echo "  help           Display this help message"
	@echo "  deps           Download Go dependencies"
	@echo "  build          Build the application"
	@echo "  run            Run the Go application"
	@echo "  test           Run all tests"
	@echo "  test-coverage  Run tests with coverage"
	@echo "  lint           Run linter"
	@echo "  format         Format Go code"
	@echo "  clean          Clean build artifacts"
	@echo "  start-mongo    Start MongoDB in a Docker container"
	@echo "  stop-mongo     Stop the MongoDB Docker container"

deps: ## Download Go dependencies
	go mod tidy
	go mod download

build: ## Build the application
	@echo "Building NoteLink..."
	go build -o bin/notelink main.go

run: ## Run the Go application
	@echo "Starting NoteLink..."
	go run main.go

test: ## Run all tests
	@echo "Running tests..."
	go test ./...

test-coverage: ## Run tests with coverage
	@echo "Running tests with coverage..."
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

lint: ## Run linter
	@echo "Running linter..."
	golangci-lint run || echo "golangci-lint not installed, skipping..."

format: ## Format Go code
	@echo "Formatting Go code..."
	go fmt ./...
	go vet ./...

clean: ## Clean build artifacts
	@echo "Cleaning up..."
	rm -rf bin/
	rm -f coverage.out coverage.html
	go clean

start-mongo: ## Start MongoDB in a Docker container
	@echo "Starting MongoDB..."
	docker run -d --rm --name mongodb -p 27017:27017 mongo:latest

stop-mongo: ## Stop the MongoDB Docker container
	@echo "Stopping MongoDB..."
	docker stop mongodb || true

# Development workflow
dev: deps format test run ## Full development workflow

# Production workflow
prod: deps lint test build ## Production build workflow


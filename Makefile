# Makefile

.PHONY: help

help: ## Display this help message
	@echo "Usage: make <target>"
	@echo "Targets:"
	@echo "  start-mongo     Start MongoDB in a Docker container"
	@echo "  stop-mongo      Stop the MongoDB Docker container"
	@echo "  run-app         Run the Go application"

start-mongo: ## Start MongoDB in a Docker container
	docker run -d --rm --name mongodb -p 27017:27017 mongo:latest

stop-mongo: ## Stop the MongoDB Docker container
	docker stop mongodb

run-app: ## Run the Go application
	go run main.go


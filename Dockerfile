# Build stage
FROM golang:1.21.3-alpine AS builder

WORKDIR /app

# Install git for go modules
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Copy wait script (optional, for database readiness)
COPY --from=builder /app/wait-for-it.sh .

# Make scripts executable
RUN chmod +x wait-for-it.sh

# Expose port
EXPOSE 8080

# Run the binary
CMD ["./main"]
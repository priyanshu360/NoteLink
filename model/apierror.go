package model

type APIError struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
}

func (e *APIError) Error() string {
	return e.Message
}

func NewAPIError(status int, message string) *APIError {
	return &APIError{Status: status, Message: message}
}

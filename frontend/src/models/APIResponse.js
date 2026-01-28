// API Response wrapper for consistent error handling
export class APIResponse {
  constructor(success = true, data = null, error = null, message = '') {
    this.success = success;
    this.data = data;
    this.error = error;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  // Create successful response
  static success(data = null, message = 'Operation successful') {
    return new APIResponse(true, data, null, message);
  }

  // Create error response
  static error(error, message = 'Operation failed') {
    return new APIResponse(false, null, error, message);
  }

  // Create validation error response
  static validationError(errors) {
    const message = errors.length === 1 
      ? errors[0] 
      : `${errors.length} validation errors occurred`;
    return new APIResponse(false, null, errors, message);
  }

  // Create paginated response
  static paginated(data, pagination, message = 'Data retrieved successfully') {
    const response = new APIResponse(true, data, null, message);
    response.pagination = pagination;
    return response;
  }
}

// Error types for consistent handling
export class ErrorTypes {
  static VALIDATION_ERROR = 'VALIDATION_ERROR';
  static AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR';
  static AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR';
  static NOT_FOUND_ERROR = 'NOT_FOUND_ERROR';
  static CONFLICT_ERROR = 'CONFLICT_ERROR';
  static RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR';
  static SERVER_ERROR = 'SERVER_ERROR';
  static NETWORK_ERROR = 'NETWORK_ERROR';
  static TIMEOUT_ERROR = 'TIMEOUT_ERROR';
}

// Custom error class for API errors
export class APIError extends Error {
  constructor(type, message, statusCode = null, details = null) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  // Static factory methods for common errors
  static validation(errors) {
    return new APIError(
      ErrorTypes.VALIDATION_ERROR,
      'Validation failed',
      400,
      errors
    );
  }

  static authentication(message = 'Authentication failed') {
    return new APIError(
      ErrorTypes.AUTHENTICATION_ERROR,
      message,
      401
    );
  }

  static authorization(message = 'Access denied') {
    return new APIError(
      ErrorTypes.AUTHORIZATION_ERROR,
      message,
      403
    );
  }

  static notFound(resource = 'Resource') {
    return new APIError(
      ErrorTypes.NOT_FOUND_ERROR,
      `${resource} not found`,
      404
    );
  }

  static conflict(message = 'Resource conflict') {
    return new APIError(
      ErrorTypes.CONFLICT_ERROR,
      message,
      409
    );
  }

  static rateLimit(message = 'Rate limit exceeded') {
    return new APIError(
      ErrorTypes.RATE_LIMIT_ERROR,
      message,
      429
    );
  }

  static serverError(message = 'Internal server error') {
    return new APIError(
      ErrorTypes.SERVER_ERROR,
      message,
      500
    );
  }

  static networkError(message = 'Network error') {
    return new APIError(
      ErrorTypes.NETWORK_ERROR,
      message,
      0
    );
  }

  static timeoutError(message = 'Request timeout') {
    return new APIError(
      ErrorTypes.TIMEOUT_ERROR,
      message,
      408
    );
  }
}

export default APIResponse;
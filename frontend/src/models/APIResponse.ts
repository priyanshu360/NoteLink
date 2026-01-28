// API Response and Error type definitions

// Generic API response interface
export interface IAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string | null;
  message?: string;
  timestamp?: string;
  pagination?: IAPIPagination;
}

// API pagination interface
export interface IAPIPagination {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API error types
export enum ErrorTypes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR'
}

// Custom API error interface
export interface IAPIError extends Error {
  type: ErrorTypes;
  statusCode?: number;
  details?: any;
  timestamp?: string;
}

// Validation error interface
export interface IValidationError {
  field: string;
  message: string;
  value?: any;
}

// API Response wrapper class
export class APIResponse<T = any> implements IAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string | null;
  message: string;
  timestamp: string;
  pagination?: IAPIPagination;

  constructor(success: boolean = true, data?: T, error?: string | null, message: string = 'Operation successful') {
    this.success = success;
    this.data = data;
    this.error = error;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  // Create successful response
  static success<T = any>(data?: T, message: string = 'Operation successful'): APIResponse<T> {
    return new APIResponse(true, data, null, message);
  }

  // Create error response
  static error(message: string = 'Operation failed'): APIResponse<never> {
    return new APIResponse(false, undefined, message);
  }

  // Create validation error response
  static validationError(errors: string[]): APIResponse<never> {
    const message = errors.length === 1 
      ? errors[0] 
      : `${errors.length} validation errors occurred`;
    return new APIResponse(false, undefined, message);
  }

  // Create paginated response
  static paginated<T = any>(data: T[], pagination: IAPIPagination, message: string = 'Data retrieved successfully'): APIResponse<T[]> {
    const response = new APIResponse<T[]>(true, data, null, message);
    response.pagination = pagination;
    return response;
  }
}

// Custom API Error class
export class APIError extends Error implements IAPIError {
  name: string = 'APIError';
  type: ErrorTypes;
  statusCode?: number;
  details?: any;
  timestamp: string;

  constructor(type: ErrorTypes, message: string, statusCode?: number, details?: any) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  // Static factory methods for common errors
  static validation(errors: string[] | IValidationError[]): APIError {
    const message = Array.isArray(errors) && errors.length === 1 
      ? (errors[0] as IValidationError)?.message || (errors[0] as string)
      : `${errors.length} validation errors occurred`;
    return new APIError(
      ErrorTypes.VALIDATION_ERROR,
      message,
      400,
      errors
    );
  }

  static authentication(message: string = 'Authentication failed'): APIError {
    return new APIError(
      ErrorTypes.AUTHENTICATION_ERROR,
      message,
      401
    );
  }

  static authorization(message: string = 'Access denied'): APIError {
    return new APIError(
      ErrorTypes.AUTHORIZATION_ERROR,
      message,
      403
    );
  }

  static notFound(resource: string = 'Resource'): APIError {
    return new APIError(
      ErrorTypes.NOT_FOUND_ERROR,
      `${resource} not found`,
      404
    );
  }

  static conflict(message: string = 'Resource conflict'): APIError {
    return new APIError(
      ErrorTypes.CONFLICT_ERROR,
      message,
      409
    );
  }

  static rateLimit(message: string = 'Rate limit exceeded'): APIError {
    return new APIError(
      ErrorTypes.RATE_LIMIT_ERROR,
      message,
      429
    );
  }

  static serverError(message: string = 'Internal server error'): APIError {
    return new APIError(
      ErrorTypes.SERVER_ERROR,
      message,
      500
    );
  }

  static networkError(message: string = 'Network error'): APIError {
    return new APIError(
      ErrorTypes.NETWORK_ERROR,
      message,
      0
    );
  }

  static timeoutError(message: string = 'Request timeout'): APIError {
    return new APIError(
      ErrorTypes.TIMEOUT_ERROR,
      message,
      408
    );
  }

  // Check if error is recoverable
  isRecoverable(): boolean {
    return [
      ErrorTypes.NETWORK_ERROR,
      ErrorTypes.TIMEOUT_ERROR,
      ErrorTypes.RATE_LIMIT_ERROR
    ].includes(this.type);
  }

  // Check if error requires re-authentication
  requiresReauth(): boolean {
    return [
      ErrorTypes.AUTHENTICATION_ERROR,
      ErrorTypes.AUTHORIZATION_ERROR
    ].includes(this.type);
  }

  // Get user-friendly error message
  getUserMessage(): string {
    switch (this.type) {
      case ErrorTypes.VALIDATION_ERROR:
        return 'Please check your input and try again.';
      case ErrorTypes.AUTHENTICATION_ERROR:
        return 'Please log in to continue.';
      case ErrorTypes.AUTHORIZATION_ERROR:
        return 'You don\'t have permission to do this.';
      case ErrorTypes.NOT_FOUND_ERROR:
        return 'The requested resource was not found.';
      case ErrorTypes.CONFLICT_ERROR:
        return 'This action conflicts with existing data.';
      case ErrorTypes.RATE_LIMIT_ERROR:
        return 'Too many requests. Please wait and try again.';
      case ErrorTypes.NETWORK_ERROR:
        return 'Network connection failed. Please check your internet.';
      case ErrorTypes.TIMEOUT_ERROR:
        return 'Request timed out. Please try again.';
      case ErrorTypes.SERVER_ERROR:
        return 'Server error occurred. Please try again later.';
      default:
        return 'An unexpected error occurred.';
    }
  }
}

export default APIResponse;
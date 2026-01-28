import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { IUser, IUserRegistration, IUserCredentials } from '../models/User';
import { INote, INoteCreation, INoteUpdate, INoteFilters } from '../models/Note';
import { 
  IAPIResponse, 
  IAPIPagination, 
  IAPIError, 
  IAuthAPI, 
  INotesAPI, 
  IUtilsAPI,
  ErrorTypes,
  APIError 
} from '../types/api';
import { IAPIConfig, IRequestConfig } from '../types/api';

// API Configuration
const API_CONFIG: IAPIConfig = {
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
  }
};

// Create axios instance with type safety
const api: AxiosInstance = axios.create(API_CONFIG);

// Request interceptor with typing
api.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
    }

    // Log request in development
    if (process.env.REACT_APP_DEBUG_API === 'true') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        headers: config.headers
      });
    }

    return config;
  },
  (error: any): Promise<any> => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with typing
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Log response in development
    if (process.env.REACT_APP_DEBUG_API === 'true') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
    }

    return response;
  },
  (error: any): Promise<IAPIError> => {
    let apiError: IAPIError;

    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      apiError = APIError.timeoutError('Request timeout. Please try again.');
    } else if (!error.response) {
      apiError = APIError.networkError('Network error. Please check your connection.');
    } else {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          // Clear authentication data and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          
          apiError = APIError.authentication(data.error || 'Authentication required');
          break;

        case 403:
          apiError = APIError.authorization(data.error || 'Access denied');
          break;

        case 404:
          apiError = APIError.notFound(data.error || 'Resource not found');
          break;

        case 409:
          apiError = APIError.conflict(data.error || 'Resource conflict');
          break;

        case 422:
          apiError = APIError.validation(data.error || 'Validation failed', data.details || null);
          break;

        case 429:
          apiError = APIError.rateLimit(data.error || 'Too many requests. Please try again later.');
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          apiError = APIError.serverError(data.error || 'Server error. Please try again later.');
          break;

        default:
          apiError = APIError.serverError(`HTTP ${status} error`, status);
      }
    }

    console.error('❌ API Error:', apiError);
    return Promise.reject(apiError);
  }
);

// Enhanced Authentication API implementation
export const authAPI: IAuthAPI = {
  signup: async (userData: IUserRegistration): Promise<IAPIResponse<{ user: IUser }>> => {
    try {
      // Validate user data before sending
      const user = new (await import('../models/User')).User(userData);
      const validation = (user as any).validate?.();
      
      if (validation && !validation.isValid) {
        throw APIError.validation(validation.errors);
      }

      const response = await api.post<IAPIResponse<{ user: IUser }>>('/auth/signup', user.toJSON());
      
      return {
        data: response.data.data,
        success: true,
        message: 'User created successfully'
      };
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials: IUserCredentials): Promise<IAPIResponse<{ user: IUser; token: string }>> => {
    try {
      const response = await api.post<IAPIResponse<{ user: IUser; token: string }>>('/auth/login', credentials);
      
      // Extract user and token from response
      const { user: userData, token } = response.data.data;
      
      // Validate token format
      if (!token || typeof token !== 'string') {
        throw APIError.authentication('Invalid authentication response');
      }

      return {
        data: { user: userData, token },
        success: true,
        message: 'Login successful'
      };
    } catch (error) {
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Optional: Call server logout endpoint if available
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  refreshToken: async (): Promise<string> => {
    try {
      const response = await api.post<IAPIResponse<{ token: string }>>('/auth/refresh');
      return response.data.data.token;
    } catch (error) {
      // If refresh fails, user needs to login again
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  }
};

// Enhanced Notes API implementation
export const notesAPI: INotesAPI = {
  getAll: async (params: INoteFilters = {}): Promise<IAPIResponse<INote[]>> => {
    try {
      const response = await api.get<IAPIResponse<INote[]>>('/notes', { 
        params: {
          page: params.page || 1,
          limit: params.limit || parseInt(process.env.REACT_APP_ITEMS_PER_PAGE || '20'),
          sort: params.sort || 'updated_desc',
          ...params
        }
      });
      
      return {
        data: response.data.data,
        success: true,
        message: 'Notes retrieved successfully',
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total: response.headers['x-total-count'] || response.data.data.length,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: string): Promise<IAPIResponse<INote>> => {
    try {
      const response = await api.get<IAPIResponse<INote>>(`/notes/${id}`);
      
      return {
        data: response.data.data,
        success: true,
        message: 'Note retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  },

  create: async (noteData: INoteCreation): Promise<IAPIResponse<INote>> => {
    try {
      // Import Note class dynamically to avoid circular dependency
      const NoteModule = await import('../models/Note');
      const note = new (NoteModule as any).Note(noteData);
      const validation = note.validate();
      
      if (!validation.isValid) {
        throw APIError.validation(validation.errors);
      }

      const response = await api.post<IAPIResponse<INote>>('/notes', note.toJSON());
      
      return {
        data: response.data.data,
        success: true,
        message: 'Note created successfully'
      };
    } catch (error) {
      throw error;
    }
  },

  update: async (id: string, noteData: INoteUpdate): Promise<IAPIResponse<INote>> => {
    try {
      const NoteModule = await import('../models/Note');
      const note = new (NoteModule as any).Note({ ...noteData, id });
      const validation = note.validate();
      
      if (!validation.isValid) {
        throw APIError.validation(validation.errors);
      }

      const response = await api.put<IAPIResponse<INote>>(`/notes/${id}`, note.toJSON());
      
      return {
        data: response.data.data,
        success: true,
        message: 'Note updated successfully'
      };
    } catch (error) {
      throw error;
    }
  },

  delete: async (id: string): Promise<IAPIResponse<null>> => {
    try {
      await api.delete(`/notes/${id}`);
      
      return {
        data: null,
        success: true,
        message: 'Note deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  },

  share: async (id: string, targetUserId: string): Promise<IAPIResponse<null>> => {
    try {
      await api.post(`/notes/${id}/share`, { 
        target_user_id: targetUserId 
      });
      
      return {
        data: null,
        success: true,
        message: 'Note shared successfully'
      };
    } catch (error) {
      throw error;
    }
  },

  search: async (query: string, params: INoteFilters = {}): Promise<IAPIResponse<INote[]>> => {
    try {
      const minLength = parseInt(process.env.REACT_APP_MIN_SEARCH_LENGTH || '2');
      
      if (!query || query.trim().length < minLength) {
        return {
          data: [],
          success: true,
          message: 'Search query too short'
        };
      }

      const response = await api.get<IAPIResponse<INote[]>>('/search', { 
        params: {
          q: query.trim(),
          page: params.page || 1,
          limit: params.limit || parseInt(process.env.REACT_APP_MAX_SEARCH_RESULTS || '50'),
          ...params
        }
      });
      
      return {
        data: response.data.data,
        success: true,
        message: `Found ${response.data.data.length} results`
      };
    } catch (error) {
      throw error;
    }
  },

  duplicate: async (id: string): Promise<IAPIResponse<INote>> => {
    try {
      // First get the original note
      const originalNote = await notesAPI.getById(id);
      const duplicatedNote = (originalNote.data as any).clone();
      
      // Create the duplicate
      return await notesAPI.create(duplicatedNote.toJSON());
    } catch (error) {
      throw error;
    }
  }
};

// Utility API implementation
export const utilsAPI: IUtilsAPI = {
  health: async (): Promise<IAPIResponse<{ status: string; timestamp: string }>> => {
    try {
      const response = await api.get<IAPIResponse<{ status: string; timestamp: string }>>('/health');
      
      return {
        data: response.data.data,
        success: true,
        message: 'Health check successful'
      };
    } catch (error) {
      throw error;
    }
  },

  version: async (): Promise<IAPIResponse<{ version: string; build: string }>> => {
    try {
      const response = await api.get<IAPIResponse<{ version: string; build: string }>>('/version');
      
      return {
        data: response.data.data,
        success: true,
        message: 'Version retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  },

  metrics: async (): Promise<IAPIResponse<any>> => {
    try {
      const response = await api.get<IAPIResponse<any>>('/metrics');
      
      return {
        data: response.data.data,
        success: true,
        message: 'Metrics retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }
};

// Export default api instance for advanced usage
export default api;
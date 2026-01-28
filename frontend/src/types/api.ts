// API type definitions

// Base API configuration
export interface IAPIConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// Request configuration
export interface IRequestConfig {
  method?: string;
  url?: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

// Response interceptors
export interface IResponseInterceptor {
  (response: any): any;
}

// Error interceptor
export interface IErrorInterceptor {
  (error: any): any;
}

// Axios instance interface
export interface IAxiosInstance {
  get<T = any>(url: string, config?: IRequestConfig): Promise<IAPIResponse<T>>;
  post<T = any>(url: string, data?: any, config?: IRequestConfig): Promise<IAPIResponse<T>>;
  put<T = any>(url: string, data?: any, config?: IRequestConfig): Promise<IAPIResponse<T>>;
  delete<T = any>(url: string, config?: IRequestConfig): Promise<IAPIResponse<T>>;
  interceptors: {
    request: {
      use(onFulfilled?: (value: any) => any, onRejected?: (error: any) => any): number;
    };
    response: {
      use(onFulfilled?: IResponseInterceptor, onRejected?: IErrorInterceptor): number;
    };
  };
}

// Authentication API interfaces
export interface IAuthAPI {
  signup(userData: IUserRegistration): Promise<IAPIResponse<IUserResponse>>;
  login(credentials: IUserCredentials): Promise<IAPIResponse<IUserResponse>>;
  logout(): Promise<void>;
  refreshToken(): Promise<string>;
}

// Notes API interfaces
export interface INotesAPI {
  getAll(params?: INoteFilters): Promise<IAPIResponse<INote[]>>;
  getById(id: string): Promise<IAPIResponse<INote>>;
  create(noteData: INoteCreation): Promise<IAPIResponse<INote>>;
  update(id: string, noteData: INoteUpdate): Promise<IAPIResponse<INote>>;
  delete(id: string): Promise<IAPIResponse<null>>;
  share(id: string, targetUserId: string): Promise<IAPIResponse<null>>;
  search(query: string, params?: INoteFilters): Promise<IAPIResponse<INote[]>>;
  duplicate(id: string): Promise<IAPIResponse<INote>>;
}

// Utility API interfaces
export interface IUtilsAPI {
  health(): Promise<IAPIResponse<{ status: string; timestamp: string }>>;
  version(): Promise<IAPIResponse<{ version: string; build: string }>>;
  metrics(): Promise<IAPIResponse<any>>;
}

// Import interfaces from models
import { IUser, IUserRegistration, IUserCredentials, IUserResponse } from '../models/User';
import { INote, INoteCreation, INoteUpdate, INoteFilters } from '../models/Note';
import { IAPIResponse } from '../models/APIResponse';
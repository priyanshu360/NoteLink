import { AuthUser, LoginResponseData, SignupRequest, LoginRequest } from '../models/Auth';
import { INote, INoteCreation, INoteUpdate, INoteFilters } from '../models/Note';
import { IAPIResponse, IAPIError, ErrorTypes, APIError } from '../models/APIResponse';

export interface IAPIConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface IRequestConfig {
  method?: string;
  url?: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface IResponseInterceptor {
  (response: any): any;
}

export interface IErrorInterceptor {
  (error: any): any;
}

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

export interface IAuthAPI {
  signup(userData: SignupRequest): Promise<IAPIResponse<{ user: AuthUser }>>;
  login(credentials: LoginRequest): Promise<IAPIResponse<LoginResponseData>>;
  logout(): Promise<void>;
  refreshToken(): Promise<string>;
}

export type { AuthUser, SignupRequest, LoginRequest, LoginResponseData };
export type { INote, INoteCreation, INoteUpdate, INoteFilters };
export type { IAPIResponse, IAPIError };
export { ErrorTypes, APIError };

export interface INotesAPI {
  getAll(params?: INoteFilters): Promise<IAPIResponse<INote[]>>;
  getById(id: string): Promise<IAPIResponse<INote>>;
  create(noteData: INoteCreation): Promise<IAPIResponse<INote>>;
  update(id: string, noteData: INoteUpdate): Promise<IAPIResponse<INote>>;
  delete(id: string): Promise<IAPIResponse<null>>;
  share(id: string, username: string): Promise<IAPIResponse<null>>;
  search(query: string, params?: INoteFilters): Promise<IAPIResponse<INote[]>>;
  duplicate(id: string): Promise<IAPIResponse<INote>>;
}

export interface IUtilsAPI {
  health(): Promise<IAPIResponse<{ status: string; timestamp: string }>>;
  version(): Promise<IAPIResponse<{ version: string; build: string }>>;
  metrics(): Promise<IAPIResponse<any>>;
}

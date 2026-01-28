// React Context type definitions

// Authentication state interface
export interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  loginAttempts: number;
  registrationSuccess?: boolean;
}

// Authentication action types
export interface IAuthActions {
  login: (credentials: IUserCredentials) => Promise<{ success: boolean; user?: IUser; token?: string; error?: string }>;
  register: (userData: IUserRegistration) => Promise<{ success: boolean; user?: IUser; error?: string }>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: Partial<IUser>) => void;
}

// Authentication context interface
export interface IAuthContext extends IAuthState, IAuthActions {}

// Notes state interface
export interface INotesState {
  notes: INote[];
  currentNote: INote | null;
  loading: boolean;
  error: string | null;
  searchResults: INote[];
  searching: boolean;
  searchQuery: string;
  filter: 'all' | 'shared' | 'recent' | 'pinned';
  sortBy: 'updated_asc' | 'updated_desc' | 'created_asc' | 'created_desc' | 'title_asc' | 'title_desc';
  pagination: INotePagination;
}

// Notes action types
export interface INotesActions {
  fetchNotes: () => Promise<INote[]>;
  createNote: (noteData: INoteCreation) => Promise<INote>;
  updateNote: (id: string, noteData: INoteUpdate) => Promise<INote>;
  deleteNote: (id: string) => Promise<boolean>;
  searchNotes: (query: string) => Promise<INote[]>;
  clearSearch: () => void;
  setFilter: (filter: 'all' | 'shared' | 'recent' | 'pinned') => void;
  setSort: (sortBy: 'updated_asc' | 'updated_desc' | 'created_asc' | 'created_desc' | 'title_asc' | 'title_desc') => void;
  setCurrentNote: (note: INote) => void;
  clearError: () => void;
}

// Notes context interface
export interface INotesContext extends INotesState, INotesActions {
  getProcessedNotes: () => INote[];
}

// React component props interfaces
export interface IAuthProviderProps {
  children: React.ReactNode;
}

export interface INotesProviderProps {
  children: React.ReactNode;
}

// Higher-order component type
export type IWithAuthComponent<T = {}> = React.ComponentType<T> & {
  displayName?: string;
}

// Route component props
export interface IProtectedRouteProps {
  children: React.ReactNode;
  user?: IUser | null;
}

// Import interfaces from models
import { IUser, IUserRegistration, IUserCredentials } from '../models/User';
import { INote, INoteCreation, INoteUpdate, INotePagination } from '../models/Note';
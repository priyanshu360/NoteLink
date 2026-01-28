import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  INotesState, 
  INotesActions, 
  INotesContext 
} from '../types/context';
import { INote, INoteCreation, INoteUpdate, INoteFilters } from '../models/Note';
import { INotePagination } from '../types/api';
import { IAPIError, ErrorTypes } from '../models/APIResponse';

// Action types
const NOTES_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  CREATE_START: 'CREATE_START',
  CREATE_SUCCESS: 'CREATE_SUCCESS',
  CREATE_FAILURE: 'CREATE_FAILURE',
  UPDATE_START: 'UPDATE_START',
  UPDATE_SUCCESS: 'UPDATE_SUCCESS',
  UPDATE_FAILURE: 'UPDATE_FAILURE',
  DELETE_START: 'DELETE_START',
  DELETE_SUCCESS: 'DELETE_SUCCESS',
  DELETE_FAILURE: 'DELETE_FAILURE',
  SEARCH_START: 'SEARCH_START',
  SEARCH_SUCCESS: 'SEARCH_SUCCESS',
  SEARCH_FAILURE: 'SEARCH_FAILURE',
  CLEAR_SEARCH: 'CLEAR_SEARCH',
  SET_FILTER: 'SET_FILTER',
  SET_SORT: 'SET_SORT',
  TOGGLE_LOADING: 'TOGGLE_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
} as const;

// Action interfaces
interface IFetchStartAction {
  type: typeof NOTES_ACTIONS.FETCH_START;
}

interface IFetchSuccessAction {
  type: typeof NOTES_ACTIONS.FETCH_SUCCESS;
  payload: INote[];
}

interface IFetchFailureAction {
  type: typeof NOTES_ACTIONS.FETCH_FAILURE;
  payload: string;
}

interface ICreateStartAction {
  type: typeof NOTES_ACTIONS.CREATE_START;
}

interface ICreateSuccessAction {
  type: typeof NOTES_ACTIONS.CREATE_SUCCESS;
  payload: INote;
}

interface ICreateFailureAction {
  type: typeof NOTES_ACTIONS.CREATE_FAILURE;
  payload: string;
}

interface IUpdateStartAction {
  type: typeof NOTES_ACTIONS.UPDATE_START;
}

interface IUpdateSuccessAction {
  type: typeof NOTES_ACTIONS.UPDATE_SUCCESS;
  payload: INote;
}

interface IUpdateFailureAction {
  type: typeof NOTES_ACTIONS.UPDATE_FAILURE;
  payload: string;
}

interface IDeleteStartAction {
  type: typeof NOTES_ACTIONS.DELETE_START;
}

interface IDeleteSuccessAction {
  type: typeof NOTES_ACTIONS.DELETE_SUCCESS;
  payload: string;
}

interface IDeleteFailureAction {
  type: typeof NOTES_ACTIONS.DELETE_FAILURE;
  payload: string;
}

interface ISearchStartAction {
  type: typeof NOTES_ACTIONS.SEARCH_START;
  payload: string;
}

interface ISearchSuccessAction {
  type: typeof NOTES_ACTIONS.SEARCH_SUCCESS;
  payload: INote[];
}

interface ISearchFailureAction {
  type: typeof NOTES_ACTIONS.SEARCH_FAILURE;
  payload: string;
}

interface IClearSearchAction {
  type: typeof NOTES_ACTIONS.CLEAR_SEARCH;
}

interface ISetFilterAction {
  type: typeof NOTES_ACTIONS.SET_FILTER;
  payload: 'all' | 'shared' | 'recent' | 'pinned';
}

interface ISetSortAction {
  type: typeof NOTES_ACTIONS.SET_SORT;
  payload: 'updated_asc' | 'updated_desc' | 'created_asc' | 'created_desc' | 'title_asc' | 'title_desc';
}

interface ISetErrorAction {
  type: typeof NOTES_ACTIONS.SET_ERROR;
  payload: string;
}

interface IClearErrorAction {
  type: typeof NOTES_ACTIONS.CLEAR_ERROR;
}

// Union type for all actions
type NotesAction = 
  | IFetchStartAction
  | IFetchSuccessAction
  | IFetchFailureAction
  | ICreateStartAction
  | ICreateSuccessAction
  | ICreateFailureAction
  | IUpdateStartAction
  | IUpdateSuccessAction
  | IUpdateFailureAction
  | IDeleteStartAction
  | IDeleteSuccessAction
  | IDeleteFailureAction
  | ISearchStartAction
  | ISearchSuccessAction
  | ISearchFailureAction
  | IClearSearchAction
  | ISetFilterAction
  | ISetSortAction
  | ISetErrorAction
  | IClearErrorAction;

// Initial state
const initialState: INotesState = {
  notes: [],
  currentNote: null,
  loading: false,
  error: null,
  searchResults: [],
  searching: false,
  searchQuery: '',
  filter: 'all',
  sortBy: 'updated_desc',
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasNext: false,
    hasPrev: false
  }
};

// Reducer
const notesReducer = (state: INotesState, action: NotesAction): INotesState => {
  switch (action.type) {
    case NOTES_ACTIONS.FETCH_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case NOTES_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        notes: action.payload,
        loading: false,
        error: null,
        pagination: {
          ...state.pagination,
          total: action.payload.length
        }
      };

    case NOTES_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case NOTES_ACTIONS.CREATE_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case NOTES_ACTIONS.CREATE_SUCCESS:
      return {
        ...state,
        notes: [action.payload, ...state.notes],
        loading: false,
        error: null,
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1
        }
      };

    case NOTES_ACTIONS.UPDATE_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case NOTES_ACTIONS.UPDATE_SUCCESS:
      return {
        ...state,
        notes: state.notes.map((note: INote) =>
          note.id === action.payload.id ? action.payload : note
        ),
        currentNote: action.payload,
        loading: false,
        error: null
      };

    case NOTES_ACTIONS.DELETE_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case NOTES_ACTIONS.DELETE_SUCCESS:
      return {
        ...state,
        notes: state.notes.filter((note: INote) => note.id !== action.payload),
        loading: false,
        error: null,
        pagination: {
          ...state.pagination,
          total: state.pagination.total - 1
        }
      };

    case NOTES_ACTIONS.SEARCH_START:
      return {
        ...state,
        searching: true,
        searchQuery: action.payload,
        error: null
      };

    case NOTES_ACTIONS.SEARCH_SUCCESS:
      return {
        ...state,
        searchResults: action.payload,
        searching: false,
        error: null
      };

    case NOTES_ACTIONS.SEARCH_FAILURE:
      return {
        ...state,
        searching: false,
        error: action.payload
      };

    case NOTES_ACTIONS.CLEAR_SEARCH:
      return {
        ...state,
        searchResults: [],
        searchQuery: '',
        searching: false
      };

    case NOTES_ACTIONS.SET_FILTER:
      return {
        ...state,
        filter: action.payload
      };

    case NOTES_ACTIONS.SET_SORT:
      return {
        ...state,
        sortBy: action.payload
      };

    case NOTES_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };

    case NOTES_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const NotesContext = createContext<INotesContext | undefined>(undefined);

// Notes provider component
export const NotesProvider: React.FC<INotesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  // Action creators with typing
  const actions: INotesActions = {
    fetchNotes: async (): Promise<INote[]> => {
      dispatch({ type: NOTES_ACTIONS.FETCH_START });

      try {
        const notesModule = await import('../services/api');
        const response = await notesModule.notesAPI.getAll();
        
        dispatch({
          type: NOTES_ACTIONS.FETCH_SUCCESS,
          payload: response.data
        });

        return response.data;
      } catch (error: any) {
        const apiError: IAPIError = new ErrorTypes.NETWORK_ERROR(
          error.response?.data?.error || error.message || 'Failed to fetch notes',
          error.response?.status
        ) as any;

        dispatch({
          type: NOTES_ACTIONS.FETCH_FAILURE,
          payload: apiError.message
        });

        throw apiError;
      }
    },

    createNote: async (noteData: INoteCreation): Promise<INote> => {
      dispatch({ type: NOTES_ACTIONS.CREATE_START });

      try {
        // Import Note class for validation
        const noteModule = await import('../models/Note');
        const note = new (noteModule as any).Note(noteData);
        const validation = note.validate();
        
        if (!validation.isValid) {
          const apiError: IAPIError = new ErrorTypes.VALIDATION_ERROR(
            validation.errors.join(', '),
            422,
            validation.errors
          ) as any;

          dispatch({
            type: NOTES_ACTIONS.CREATE_FAILURE,
            payload: apiError.message
          });
          
          throw apiError;
        }

        const notesModule = await import('../services/api');
        const response = await notesModule.notesAPI.create(noteData);
        
        dispatch({
          type: NOTES_ACTIONS.CREATE_SUCCESS,
          payload: response.data
        });

        return response.data;
      } catch (error: any) {
        const apiError: IAPIError = new ErrorTypes.VALIDATION_ERROR(
          error.response?.data?.error || error.message || 'Failed to create note',
          error.response?.status
        ) as any;

        dispatch({
          type: NOTES_ACTIONS.CREATE_FAILURE,
          payload: apiError.message
        });

        throw apiError;
      }
    },

    updateNote: async (id: string, noteData: INoteUpdate): Promise<INote> => {
      dispatch({ type: NOTES_ACTIONS.UPDATE_START });

      try {
        const noteModule = await import('../models/Note');
        const note = new (noteModule as any).Note({ ...noteData, id });
        const validation = note.validate();
        
        if (!validation.isValid) {
          const apiError: IAPIError = new ErrorTypes.VALIDATION_ERROR(
            validation.errors.join(', '),
            422,
            validation.errors
          ) as any;

          dispatch({
            type: NOTES_ACTIONS.UPDATE_FAILURE,
            payload: apiError.message
          });
          
          throw apiError;
        }

        const notesModule = await import('../services/api');
        const response = await notesModule.notesAPI.update(id, noteData);
        
        dispatch({
          type: NOTES_ACTIONS.UPDATE_SUCCESS,
          payload: response.data
        });

        return response.data;
      } catch (error: any) {
        const apiError: IAPIError = new ErrorTypes.VALIDATION_ERROR(
          error.response?.data?.error || error.message || 'Failed to update note',
          error.response?.status
        ) as any;

        dispatch({
          type: NOTES_ACTIONS.UPDATE_FAILURE,
          payload: apiError.message
        });

        throw apiError;
      }
    },

    deleteNote: async (id: string): Promise<boolean> => {
      dispatch({ type: NOTES_ACTIONS.DELETE_START });

      try {
        const notesModule = await import('../services/api');
        await notesModule.notesAPI.delete(id);

        dispatch({
          type: NOTES_ACTIONS.DELETE_SUCCESS,
          payload: id
        });

        return true;
      } catch (error: any) {
        const apiError: IAPIError = new ErrorTypes.NETWORK_ERROR(
          error.response?.data?.error || error.message || 'Failed to delete note',
          error.response?.status
        ) as any;

        dispatch({
          type: NOTES_ACTIONS.DELETE_FAILURE,
          payload: apiError.message
        });

        throw apiError;
      }
    },

    searchNotes: async (query: string): Promise<INote[]> => {
      dispatch({ type: NOTES_ACTIONS.SEARCH_START, payload: query });

      try {
        const minLength = parseInt(process.env.REACT_APP_MIN_SEARCH_LENGTH || '2');
        
        if (!query || query.trim().length < minLength) {
          dispatch({ type: NOTES_ACTIONS.CLEAR_SEARCH });
          return [];
        }

        const notesModule = await import('../services/api');
        const response = await notesModule.notesAPI.search(query.trim());
        
        dispatch({
          type: NOTES_ACTIONS.SEARCH_SUCCESS,
          payload: response.data
        });

        return response.data;
      } catch (error: any) {
        const apiError: IAPIError = new ErrorTypes.NETWORK_ERROR(
          error.response?.data?.error || error.message || 'Search failed',
          error.response?.status
        ) as any;

        dispatch({
          type: NOTES_ACTIONS.SEARCH_FAILURE,
          payload: apiError.message
        });

        throw apiError;
      }
    },

    clearSearch: (): void => {
      dispatch({ type: NOTES_ACTIONS.CLEAR_SEARCH });
    },

    setFilter: (filter: 'all' | 'shared' | 'recent' | 'pinned'): void => {
      dispatch({ type: NOTES_ACTIONS.SET_FILTER, payload: filter });
    },

    setSort: (sortBy: 'updated_asc' | 'updated_desc' | 'created_asc' | 'created_desc' | 'title_asc' | 'title_desc'): void => {
      dispatch({ type: NOTES_ACTIONS.SET_SORT, payload: sortBy });
    },

    clearError: (): void => {
      dispatch({ type: NOTES_ACTIONS.CLEAR_ERROR });
    },

    setCurrentNote: (note: INote): void => {
      dispatch({
        type: NOTES_ACTIONS.UPDATE_SUCCESS,
        payload: note
      });
    }
  };

  // Get filtered and sorted notes
  const getProcessedNotes = (): INote[] => {
    let notes = state.searchQuery ? state.searchResults : state.notes;

    // Apply filters
    switch (state.filter) {
      case 'shared':
        notes = notes.filter((note: INote) => note.shared);
        break;
      case 'recent':
        notes = notes.filter((note: INote) => (note as any).isRecentlyUpdated());
        break;
      case 'pinned':
        notes = notes.filter((note: INote) => (note as any).isPinned);
        break;
      default:
        // 'all' - no filtering
        break;
    }

    // Apply sorting
    notes.sort((a: INote, b: INote) => {
      switch (state.sortBy) {
        case 'updated_asc':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'updated_desc':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'created_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'created_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return notes;
  };

  const value: INotesContext = {
    ...state,
    ...actions,
    getProcessedNotes
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};

// Custom hook to use notes context
export const useNotes = (): INotesContext => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export default NotesContext;
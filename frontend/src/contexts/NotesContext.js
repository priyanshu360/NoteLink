// Notes context and state management
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import Note from '../models/Note';
import APIError, { ErrorTypes } from '../models/APIResponse';

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
};

// Initial state
const initialState = {
  notes: [],
  currentNote: null,
  loading: false,
  error: null,
  searchResults: [],
  searching: false,
  searchQuery: '',
  filter: 'all', // all, shared, recent, pinned
  sortBy: 'updated_desc', // updated_asc, updated_desc, created_asc, created_desc, title_asc, title_desc
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasNext: false,
    hasPrev: false
  }
};

// Reducer
const notesReducer = (state, action) => {
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
        notes: state.notes.map(note =>
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
        notes: state.notes.filter(note => note.id !== action.payload),
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
const NotesContext = createContext();

// Notes provider component
export const NotesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  // Action creators
  const actions = {
    fetchNotes: async () => {
      dispatch({ type: NOTES_ACTIONS.FETCH_START });

      try {
        const response = await authAPI.getAll();
        const notes = response.data.map(note => Note.fromAPI(note));

        dispatch({
          type: NOTES_ACTIONS.FETCH_SUCCESS,
          payload: notes
        });

        return notes;
      } catch (error) {
        const apiError = new APIError(
          ErrorTypes.NETWORK_ERROR,
          error.response?.data?.error || error.message || 'Failed to fetch notes',
          error.response?.status
        );

        dispatch({
          type: NOTES_ACTIONS.FETCH_FAILURE,
          payload: apiError.message
        });

        throw apiError;
      }
    },

    createNote: async (noteData) => {
      dispatch({ type: NOTES_ACTIONS.CREATE_START });

      try {
        const validation = Note.createEmpty().validate();
        if (!validation.isValid) {
          throw APIError.validationError(validation.errors);
        }

        const response = await authAPI.create(noteData);
        const newNote = Note.fromAPI(response.data);

        dispatch({
          type: NOTES_ACTIONS.CREATE_SUCCESS,
          payload: newNote
        });

        return newNote;
      } catch (error) {
        const apiError = new APIError(
          ErrorTypes.VALIDATION_ERROR,
          error.response?.data?.error || error.message || 'Failed to create note',
          error.response?.status
        );

        dispatch({
          type: NOTES_ACTIONS.CREATE_FAILURE,
          payload: apiError.message
        });

        throw apiError;
      }
    },

    updateNote: async (id, noteData) => {
      dispatch({ type: NOTES_ACTIONS.UPDATE_START });

      try {
        const note = new Note({ ...noteData, id });
        const validation = note.validate();
        
        if (!validation.isValid) {
          throw APIError.validationError(validation.errors);
        }

        const response = await authAPI.update(id, noteData);
        const updatedNote = Note.fromAPI(response.data);

        dispatch({
          type: NOTES_ACTIONS.UPDATE_SUCCESS,
          payload: updatedNote
        });

        return updatedNote;
      } catch (error) {
        const apiError = new APIError(
          ErrorTypes.VALIDATION_ERROR,
          error.response?.data?.error || error.message || 'Failed to update note',
          error.response?.status
        );

        dispatch({
          type: NOTES_ACTIONS.UPDATE_FAILURE,
          payload: apiError.message
        });

        throw apiError;
      }
    },

    deleteNote: async (id) => {
      dispatch({ type: NOTES_ACTIONS.DELETE_START });

      try {
        await authAPI.delete(id);

        dispatch({
          type: NOTES_ACTIONS.DELETE_SUCCESS,
          payload: id
        });

        return true;
      } catch (error) {
        const apiError = new APIError(
          ErrorTypes.NETWORK_ERROR,
          error.response?.data?.error || error.message || 'Failed to delete note',
          error.response?.status
        );

        dispatch({
          type: NOTES_ACTIONS.DELETE_FAILURE,
          payload: apiError.message
        });

        throw apiError;
      }
    },

    searchNotes: async (query) => {
      dispatch({ type: NOTES_ACTIONS.SEARCH_START, payload: query });

      try {
        if (!query || query.trim().length < 2) {
          dispatch({ type: NOTES_ACTIONS.CLEAR_SEARCH });
          return [];
        }

        const response = await authAPI.search(query.trim());
        const searchResults = response.data.map(note => Note.fromAPI(note));

        dispatch({
          type: NOTES_ACTIONS.SEARCH_SUCCESS,
          payload: searchResults
        });

        return searchResults;
      } catch (error) {
        const apiError = new APIError(
          ErrorTypes.NETWORK_ERROR,
          error.response?.data?.error || error.message || 'Search failed',
          error.response?.status
        );

        dispatch({
          type: NOTES_ACTIONS.SEARCH_FAILURE,
          payload: apiError.message
        });

        throw apiError;
      }
    },

    clearSearch: () => {
      dispatch({ type: NOTES_ACTIONS.CLEAR_SEARCH });
    },

    setFilter: (filter) => {
      dispatch({ type: NOTES_ACTIONS.SET_FILTER, payload: filter });
    },

    setSort: (sortBy) => {
      dispatch({ type: NOTES_ACTIONS.SET_SORT, payload: sortBy });
    },

    clearError: () => {
      dispatch({ type: NOTES_ACTIONS.CLEAR_ERROR });
    },

    setCurrentNote: (note) => {
      dispatch({
        type: NOTES_ACTIONS.UPDATE_SUCCESS,
        payload: note
      });
    }
  };

  // Get filtered and sorted notes
  const getProcessedNotes = () => {
    let notes = state.searchQuery ? state.searchResults : state.notes;

    // Apply filters
    switch (state.filter) {
      case 'shared':
        notes = notes.filter(note => note.shared);
        break;
      case 'recent':
        notes = notes.filter(note => note.isRecentlyUpdated());
        break;
      case 'pinned':
        notes = notes.filter(note => note.isPinned);
        break;
      default:
        // 'all' - no filtering
        break;
    }

    // Apply sorting
    notes.sort((a, b) => {
      switch (state.sortBy) {
        case 'updated_asc':
          return new Date(a.updatedAt) - new Date(b.updatedAt);
        case 'updated_desc':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case 'created_asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'created_desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });

    return notes;
  };

  const value = {
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
export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export default NotesContext;
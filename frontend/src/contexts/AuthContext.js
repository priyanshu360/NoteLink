// Authentication context and state management
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import User from '../models/User';
import APIError, { ErrorTypes } from '../models/APIResponse';

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER'
};

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null,
  loginAttempts: 0
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null,
        loginAttempts: state.loginAttempts + 1
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
        loginAttempts: 0
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
        loginAttempts: state.loginAttempts + 1
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        registrationSuccess: true
      };

    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.TOKEN_REFRESH:
      return {
        ...state,
        token: action.payload
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token }
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid stored data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
    } else {
      localStorage.removeItem('token');
    }

    if (state.user) {
      localStorage.setItem('user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('user');
    }
  }, [state.token, state.user]);

  // Check token expiration
  useEffect(() => {
    if (state.token) {
      const checkTokenExpiration = () => {
        try {
          const payload = JSON.parse(atob(state.token.split('.')[1]));
          const now = Date.now() / 1000;
          
          if (payload.exp < now) {
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        } catch (error) {
          console.error('Error checking token expiration:', error);
        }
      };

      // Check immediately and then every 5 minutes
      checkTokenExpiration();
      const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [state.token]);

  // Action creators
  const actions = {
    login: async (credentials) => {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new APIError(
            ErrorTypes.AUTHENTICATION_ERROR,
            data.error || 'Login failed',
            response.status
          );
        }

        const user = User.fromAPI(data.user);
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token: data.token }
        });

        return { success: true, user, token: data.token };
      } catch (error) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: error.message || 'Login failed'
        });
        return { success: false, error: error.message };
      }
    },

    register: async (userData) => {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new APIError(
            ErrorTypes.VALIDATION_ERROR,
            data.error || 'Registration failed',
            response.status
          );
        }

        const user = User.fromAPI(data);
        
        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS
        });

        return { success: true, user };
      } catch (error) {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_FAILURE,
          payload: error.message || 'Registration failed'
        });
        return { success: false, error: error.message };
      }
    },

    logout: () => {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    },

    clearError: () => {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    },

    updateUser: (userData) => {
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: userData
      });
    }
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
export const withAuth = (Component) => {
  return (props) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    if (!isAuthenticated) {
      return <div className="auth-required">Authentication required</div>;
    }

    return <Component {...props} />;
  };
};

export default AuthContext;
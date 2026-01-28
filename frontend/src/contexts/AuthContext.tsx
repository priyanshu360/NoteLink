import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  IAuthState, 
  IAuthActions, 
  IAuthContext 
} from '../types/context';
import { 
  IUser, 
  IUserRegistration, 
  IUserCredentials 
} from '../models/User';
import { IAPIError, ErrorTypes } from '../models/APIResponse';

// Action types with typing
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
} as const;

// Action interfaces
interface ILoginStartAction {
  type: typeof AUTH_ACTIONS.LOGIN_START;
}

interface ILoginSuccessAction {
  type: typeof AUTH_ACTIONS.LOGIN_SUCCESS;
  payload: { user: IUser; token: string };
}

interface ILoginFailureAction {
  type: typeof AUTH_ACTIONS.LOGIN_FAILURE;
  payload: string;
}

interface ILogoutAction {
  type: typeof AUTH_ACTIONS.LOGOUT;
}

interface IRegisterStartAction {
  type: typeof AUTH_ACTIONS.REGISTER_START;
}

interface IRegisterSuccessAction {
  type: typeof AUTH_ACTIONS.REGISTER_SUCCESS;
}

interface IRegisterFailureAction {
  type: typeof AUTH_ACTIONS.REGISTER_FAILURE;
  payload: string;
}

interface ITokenRefreshAction {
  type: typeof AUTH_ACTIONS.TOKEN_REFRESH;
  payload: string;
}

interface IClearErrorAction {
  type: typeof AUTH_ACTIONS.CLEAR_ERROR;
}

interface IUpdateUserAction {
  type: typeof AUTH_ACTIONS.UPDATE_USER;
  payload: Partial<IUser>;
}

// Union type for all actions
type AuthAction = 
  | ILoginStartAction
  | ILoginSuccessAction
  | ILoginFailureAction
  | ILogoutAction
  | IRegisterStartAction
  | IRegisterSuccessAction
  | IRegisterFailureAction
  | ITokenRefreshAction
  | IClearErrorAction
  | IUpdateUserAction;

// Initial state
const initialState: IAuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null,
  loginAttempts: 0
};

// Reducer with type safety
const authReducer = (state: IAuthState, action: AuthAction): IAuthState => {
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
        user: state.user ? { ...state.user, ...action.payload } : null
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<IAuthContext | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<IAuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const user: IUser = JSON.parse(storedUser);
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
      const checkTokenExpiration = (): void => {
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

      return (): void => clearInterval(interval);
    }
  }, [state.token]);

  // Action creators with typing
  const actions: IAuthActions = {
    login: async (credentials: IUserCredentials): Promise<{ success: boolean; user?: IUser; token?: string; error?: string }> => {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      try {
        // Import and use authAPI
        const authModule = await import('../services/api');
        const response = await authModule.authAPI.login(credentials);
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: response.data.user, token: response.data.token }
        });

        return { success: true, ...response.data };
      } catch (error: any) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: error.message || 'Login failed'
        });
        return { success: false, error: error.message };
      }
    },

    register: async (userData: IUserRegistration): Promise<{ success: boolean; user?: IUser; error?: string }> => {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });

      try {
        const authModule = await import('../services/api');
        const response = await authModule.authAPI.signup(userData);
        
        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS
        });

        return { success: true, user: response.data.user };
      } catch (error: any) {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_FAILURE,
          payload: error.message || 'Registration failed'
        });
        return { success: false, error: error.message };
      }
    },

    logout: (): void => {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    },

    clearError: (): void => {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    },

    updateUser: (userData: Partial<IUser>): void => {
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: userData
      });
    }
  };

  const value: IAuthContext = {
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
export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  const WrappedComponent = (props: P) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    if (!isAuthenticated) {
      return <div className="auth-required">Authentication required</div>;
    }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default AuthContext;
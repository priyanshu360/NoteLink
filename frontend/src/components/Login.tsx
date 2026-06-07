import React, { useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LoginRequest } from '../types/api';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

interface ILoginState {
  credentials: LoginRequest;
  fieldErrors: { username?: string; password?: string };
  loading: boolean;
  error: string | null;
}

const validate = (creds: LoginRequest) => {
  const errors: { username?: string; password?: string } = {};
  const username = creds.username.trim();
  const password = creds.password;
  if (!username) errors.username = 'Username is required';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  return errors;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [state, setState] = useState<ILoginState>({
    credentials: { username: '', password: '' },
    fieldErrors: {},
    loading: false,
    error: null
  });

  React.useEffect(() => {
    if (location.state?.message) {
      setState(prev => ({ ...prev, error: null }));
    }
  }, [location.state]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setState(prev => {
      const creds = { ...prev.credentials, [name]: value };
      return {
        ...prev,
        credentials: creds,
        fieldErrors: validate(creds),
        error: null
      };
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    const errors = validate(state.credentials);
    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, fieldErrors: errors }));
      return;
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    const result = await login({ username: state.credentials.username.trim(), password: state.credentials.password });
    if (!result.success) {
      setState(prev => ({ ...prev, loading: false, error: result.error || 'Login failed' }));
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="form-container">
        <h1 className="form-title">Welcome Back</h1>
        
        {location.state?.message && (
          <div className="success-message" role="alert">
            {location.state.message}
          </div>
        )}

        {state.error && (
          <div className="error-message" role="alert">
            {state.error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={`form-input${state.fieldErrors.username ? ' input-error' : ''}`}
              value={state.credentials.username}
              onChange={handleChange}
              disabled={state.loading}
              autoFocus
            />
            {state.fieldErrors.username && (
              <div className="field-error">{state.fieldErrors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input${state.fieldErrors.password ? ' input-error' : ''}`}
              value={state.credentials.password}
              onChange={handleChange}
              disabled={state.loading}
            />
            {state.fieldErrors.password && (
              <div className="field-error">{state.fieldErrors.password}</div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={state.loading}
          >
            {state.loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <span style={{ color: '#666' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#667eea', textDecoration: 'none' }}>
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
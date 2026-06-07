import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

interface ISignupState {
  username: string;
  password: string;
  confirmPassword: string;
  fieldErrors: { username?: string; password?: string; confirmPassword?: string };
  loading: boolean;
  error: string | null;
}

const validate = (username: string, password: string, confirmPassword: string) => {
  const errors: { username?: string; password?: string; confirmPassword?: string } = {};
  if (!username.trim()) errors.username = 'Username is required';
  else if (username.trim().length < 3) errors.username = 'Username must be at least 3 characters';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
};

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [state, setState] = useState<ISignupState>({
    username: '',
    password: '',
    confirmPassword: '',
    fieldErrors: {},
    loading: false,
    error: null
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setState(prev => {
      const username = name === 'username' ? value : prev.username;
      const password = name === 'password' ? value : prev.password;
      const confirmPassword = name === 'confirmPassword' ? value : prev.confirmPassword;
      return {
        ...prev,
        [name]: value,
        fieldErrors: validate(username, password, confirmPassword),
        error: null
      };
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    const errors = validate(state.username, state.password, state.confirmPassword);
    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, fieldErrors: errors }));
      return;
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    const result = await register({ username: state.username.trim(), password: state.password });
    if (!result.success) {
      setState(prev => ({ ...prev, loading: false, error: result.error || 'Registration failed' }));
      return;
    }
    navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
  };

  return (
    <div className="auth-container">
      <div className="form-container">
        <h1 className="form-title">Create Account</h1>
        
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
              value={state.username}
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
              value={state.password}
              onChange={handleChange}
              disabled={state.loading}
            />
            {state.fieldErrors.password && (
              <div className="field-error">{state.fieldErrors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`form-input${state.fieldErrors.confirmPassword ? ' input-error' : ''}`}
              value={state.confirmPassword}
              onChange={handleChange}
              disabled={state.loading}
            />
            {state.fieldErrors.confirmPassword && (
              <div className="field-error">{state.fieldErrors.confirmPassword}</div>
            )}
            {state.confirmPassword && !state.fieldErrors.confirmPassword && state.password && (
              <div className="password-match-ok">Passwords match</div>
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
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <span style={{ color: '#666' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signup;

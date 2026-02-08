import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { IUserCredentials } from '../types/api';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

// Login component with TypeScript
interface ILoginState {
  credentials: IUserCredentials;
  loading: boolean;
  error: string | null;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [state, setState] = useState<ILoginState>({
    credentials: {
      username: '',
      password: ''
    },
    loading: false,
    error: null
  });

  React.useEffect(() => {
    // Check for success message from signup
    if (location.state?.message) {
      setState(prev => ({ ...prev, error: null }));
    }
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [name]: value
      },
      error: null
    }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await login(state.credentials);
      navigate('/dashboard');
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Login failed'
      }));
    }
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              value={state.credentials.username}
              onChange={handleChange}
              required
              disabled={state.loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={state.credentials.password}
              onChange={handleChange}
              required
              disabled={state.loading}
            />
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
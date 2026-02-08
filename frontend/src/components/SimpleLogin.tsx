import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IUserCredentials } from '../types/api';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

// Simple Login component
const SimpleLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [credentials, setCredentials] = React.useState<IUserCredentials>({
    username: '',
    password: ''
  });
  
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(credentials);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="form-container">
        <h1 className="form-title">🔐 Welcome Back</h1>
        
        {error && (
          <div className="error-message" role="alert">
            {error}
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
              value={credentials.username}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your username"
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
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || !credentials.username || !credentials.password}
          >
            {loading ? (
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
            <Link 
              to="/signup" 
              style={{ color: '#667eea', textDecoration: 'none' }}
            >
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SimpleLogin;
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { INavbarProps } from '../types/components';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

// Navbar component with TypeScript
const Navbar: React.FC<INavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActivePath = (path: string): boolean => {
    return location.pathname === path;
  };

  const handleLogout = (): void => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="navbar-brand">
          📝 NoteLink
        </Link>
        
        <div className="navbar-nav">
          <Link
            to="/dashboard"
            className={`nav-link ${isActivePath('/dashboard') ? 'active' : ''}`}
          >
            📚 My Notes
          </Link>
          <Link
            to="/search"
            className={`nav-link ${isActivePath('/search') ? 'active' : ''}`}
          >
            🔍 Search
          </Link>
          
          {user && (
            <div className="navbar-user">
              <span className="user-info">
                👤 {user.username}
              </span>
              <button 
                className="logout-btn"
                onClick={handleLogout}
                title="Logout"
                type="button"
              >
                🚪
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
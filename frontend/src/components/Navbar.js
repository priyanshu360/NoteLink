import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const isActivePath = (path) => {
    return location.pathname === path;
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
          
          <div className="navbar-user">
            <span className="user-info">
              👤 {user?.username}
            </span>
            <button 
              className="logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
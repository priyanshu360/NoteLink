import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { INavbarProps } from './types/components';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import Notes from './components/Notes';
import SearchResults from './components/SearchResults';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import './App.css';

// Location state interface
interface ILocationState {
  message?: string;
}

// Main App component with TypeScript
const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading NoteLink...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {user && <Navbar user={user} onLogout={() => console.log('logout')} />}
      
      <Routes>
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <Login />
          } 
        />
        <Route 
          path="/signup" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <Signup />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute user={user}>
              <Notes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/search" 
          element={
            <ProtectedRoute user={user}>
              <SearchResults />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/" 
          element={
            <Navigate to={user ? "/dashboard" : "/login"} replace />
          } 
        />
      </Routes>
    </div>
  );
};

export default App;
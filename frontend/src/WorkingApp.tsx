import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import SimpleLogin from './components/SimpleLogin';
import SimpleNotes from './components/SimpleNotes';
import './App.css';

// Working App with simple components
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
      <Routes>
        <Route 
          path="/login" 
          element={<SimpleLogin />}
        />
        <Route 
          path="/dashboard" 
          element={
            user ? <SimpleNotes /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/" 
          element={
            user ? <SimpleNotes /> : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </div>
  );
};

export default App;
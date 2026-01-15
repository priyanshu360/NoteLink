import React, { useState } from 'react';
import { notesAPI } from '../services/api';
import './Search.css';

const Search = ({ onSearchResults, onClearSearch }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setError('');
    
    // Clear search if query is empty
    if (!e.target.value.trim()) {
      onClearSearch();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await notesAPI.search(query.trim());
      onSearchResults(response.data, query);
      setError('');
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setError('');
    onClearSearch();
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            className="search-input"
            value={query}
            onChange={handleInputChange}
            placeholder="Search notes by title or content..."
            disabled={loading}
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={handleClear}
              disabled={loading}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        
        <button
          type="submit"
          className="search-button"
          disabled={loading || !query.trim()}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Searching...
            </>
          ) : (
            '🔍 Search'
          )}
        </button>
      </form>

      {error && (
        <div className="search-error" role="alert">
          {error}
        </div>
      )}

      {query && (
        <div className="search-info">
          Searching for: <strong>"{query}"</strong>
        </div>
      )}
    </div>
  );
};

export default Search;
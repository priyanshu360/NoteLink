import React, { useState } from 'react';
import { notesAPI } from '../services/api';
import Search from './Search';
import Notes from './Notes';
import './SearchResults.css';

const SearchResults = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setHasSearched(true);
    setLoading(true);
    
    try {
      const response = await notesAPI.search(query);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setSearchQuery('');
    setHasSearched(false);
  };

  const handleUpdateResults = (newResults) => {
    setSearchResults(newResults);
  };

  const renderSearchSuggestions = () => {
    const suggestions = [
      'Try using different keywords',
      'Check your spelling',
      'Use shorter search terms',
      'Search for partial words'
    ];

    return (
      <div className="search-suggestions">
        <h4>💡 Search Tips:</h4>
        <ul>
          {suggestions.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
    );
  };

  if (!hasSearched) {
    return (
      <div className="search-page">
        <div className="search-hero">
          <h1>🔍 Search Your Notes</h1>
          <p>Find any note by searching its title or content</p>
          <div className="search-hero-form">
            <Search 
              onSearchResults={handleSearch}
              onClearSearch={handleClearSearch}
            />
          </div>
        </div>
        {renderSearchSuggestions()}
      </div>
    );
  }

  return (
    <div className="search-results-page">
      <div className="search-results-header">
        <div className="search-results-count">
          {loading ? (
            'Searching...'
          ) : (
            <>
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} 
              {searchQuery && <span> for "<strong>{searchQuery}</strong>"</span>}
            </>
          )}
        </div>
        <button 
          className="search-clear-results"
          onClick={handleClearSearch}
        >
          Clear Search
        </button>
      </div>

      <Search 
        onSearchResults={handleSearch}
        onClearSearch={handleClearSearch}
      />

      {loading ? (
        <div className="loading">
          <span className="spinner"></span>
          Searching your notes...
        </div>
      ) : searchResults.length === 0 ? (
        <div className="no-search-results">
          <h3>📭 No results found</h3>
          <p>
            We couldn't find any notes matching "<strong>{searchQuery}</strong>"
          </p>
          {renderSearchSuggestions()}
        </div>
      ) : (
        <div className="search-results-list">
          <Notes notes={searchResults} onUpdate={handleUpdateResults} />
        </div>
      )}
    </div>
  );
};

export default SearchResults;
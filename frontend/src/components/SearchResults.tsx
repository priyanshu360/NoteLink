import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNotes } from '../contexts/NotesContext';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { notes, loading } = useNotes();

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(query.toLowerCase()) ||
    note.content.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <div className="notes-container">
        <div className="loading">Searching...</div>
      </div>
    );
  }

  return (
    <div className="notes-container">
      <h2>Search Results for "{query}"</h2>
      {filteredNotes.length === 0 ? (
        <p className="no-results">No notes found matching your search.</p>
      ) : (
        <div className="notes-list">
          {filteredNotes.map(note => (
            <div key={note.id} className="note-card">
              <h3>{note.title}</h3>
              <p>{note.content.substring(0, 150)}{note.content.length > 150 ? '...' : ''}</p>
              <small>Created: {new Date(note.created_at).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;

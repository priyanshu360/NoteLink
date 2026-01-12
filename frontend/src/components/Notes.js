import React, { useState, useEffect } from 'react';
import { notesAPI } from '../services/api';
import NoteForm from './NoteForm';
import './Notes.css';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getAll();
      setNotes(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch notes. Please try again.');
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setShowForm(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await notesAPI.delete(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
      setError('');
    } catch (err) {
      setError('Failed to delete note. Please try again.');
      console.error('Error deleting note:', err);
    }
  };

  const handleSaveNote = async (noteData) => {
    try {
      if (editingNote) {
        // Update existing note
        const response = await notesAPI.update(editingNote.id, noteData);
        setNotes(notes.map(note => 
          note.id === editingNote.id ? response.data : note
        ));
      } else {
        // Create new note
        const response = await notesAPI.create(noteData);
        setNotes([response.data, ...notes]);
      }
      setShowForm(false);
      setEditingNote(null);
      setError('');
    } catch (err) {
      setError(`Failed to ${editingNote ? 'update' : 'create'} note. Please try again.`);
      console.error('Error saving note:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading && notes.length === 0) {
    return (
      <div className="loading">
        <span className="spinner"></span>
        Loading your notes...
      </div>
    );
  }

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h1>My Notes</h1>
        <button 
          className="btn btn-primary" 
          onClick={handleCreateNote}
        >
          + New Note
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {showForm && (
        <NoteForm
          note={editingNote}
          onSave={handleSaveNote}
          onCancel={() => {
            setShowForm(false);
            setEditingNote(null);
          }}
        />
      )}

      <div className="notes-grid">
        {notes.length === 0 && !loading ? (
          <div className="no-notes">
            <h3>No notes yet</h3>
            <p>Create your first note to get started!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="note-card">
              <div className="note-header">
                <h3 className="note-title">{note.title}</h3>
                <div className="note-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEditNote(note)}
                    title="Edit note"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleDeleteNote(note.id)}
                    title="Delete note"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="note-content">
                {truncateContent(note.content)}
              </div>
              
              <div className="note-meta">
                <span className="note-date">
                  Created: {formatDate(note.created_at)}
                </span>
                {note.updated_at !== note.created_at && (
                  <span className="note-updated">
                    Updated: {formatDate(note.updated_at)}
                  </span>
                )}
                {note.shared && (
                  <span className="note-shared">
                    🔄 Shared
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notes;
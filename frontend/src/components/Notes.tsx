import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { INote, INoteCreation } from '../models/Note';
import { useNotes } from '../contexts/NotesContext';
import './Notes.css';

// Notes component with TypeScript
const Notes: React.FC = () => {
  const { 
    notes, 
    loading, 
    error, 
    createNote, 
    deleteNote, 
    clearError 
  } = useNotes();

  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<INote | null>(null);

  const handleCreateNote = (): void => {
    setEditingNote(null);
    setShowForm(true);
  };

  const handleEditNote = (note: INote): void => {
    setEditingNote(note);
    setShowForm(true);
  };

  const handleDeleteNote = async (noteId: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await deleteNote(noteId);
      clearError();
    } catch (error: any) {
      console.error('Delete error:', error);
    }
  };

  const handleSaveNote = async (noteData: INoteCreation): Promise<void> => {
    try {
      await createNote(noteData);
      setShowForm(false);
      setEditingNote(null);
      clearError();
    } catch (error: any) {
      console.error('Save error:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content: string, maxLength: number = 150): string => {
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
          type="button"
        >
          + New Note
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="notes-grid">
        {notes.length === 0 && !loading ? (
          <div className="no-notes">
            <h3>No notes yet</h3>
            <p>Create your first note to get started!</p>
          </div>
        ) : (
          notes.map((note: INote) => (
            <div key={note.id} className="note-card">
              <div className="note-header">
                <h3 className="note-title">{note.title}</h3>
                <div className="note-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEditNote(note)}
                    title="Edit note"
                    type="button"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleDeleteNote(note.id)}
                    title="Delete note"
                    type="button"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="note-content">
                {truncateContent(note.content || '')}
              </div>
              
              <div className="note-meta">
                <span className="note-date">
                  Created: {formatDate(note.created_at)}
                </span>
                {note.updated_at && note.updated_at !== note.created_at && (
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
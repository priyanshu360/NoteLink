import React from 'react';
import { useNavigate } from 'react-router-dom';
import { INote, INoteCreation } from '../models/Note';
import './Notes.css';

// Simple Notes component
const SimpleNotes: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock data for testing
  const [notes] = React.useState<INote[]>([
    {
      id: '1',
      user_id: 'user123',
      title: 'Welcome to NoteLink',
      content: 'This is a sample note to demonstrate the TypeScript conversion. You can edit, delete, and search notes.',
      shared: false,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      tags: ['welcome', 'getting-started'],
      color: '#667eea',
      is_pinned: true
    },
    {
      id: '2',
      user_id: 'user123',
      title: 'TypeScript Features',
      content: 'We have successfully converted the frontend to TypeScript with proper interfaces, type safety, and enhanced error handling.',
      shared: true,
      created_at: '2024-01-16T14:30:00Z',
      updated_at: '2024-01-16T14:30:00Z',
      tags: ['typescript', 'type-safety'],
      color: '#764ba2',
      is_pinned: false
    }
  ]);

  const handleCreateNote = (): void => {
    console.log('Create new note');
    // Navigate to create note page or open modal
  };

  const handleEditNote = (note: INote): void => {
    console.log('Edit note:', note.id);
  };

  const handleDeleteNote = async (noteId: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      console.log('Delete note:', noteId);
      // API call to delete note
    } catch (error) {
      console.error('Delete error:', error);
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
    if (!content) return 'No content';
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  };

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h1>📝 My Notes</h1>
        <button 
          className="btn btn-primary" 
          onClick={handleCreateNote}
          type="button"
        >
          + New Note
        </button>
      </div>

      <div className="notes-grid">
        {notes.map((note: INote) => (
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
              {truncateContent(note.content)}
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
        ))}
      </div>
    </div>
  );
};

export default SimpleNotes;
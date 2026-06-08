import React, { useState, useEffect, useCallback } from 'react';
import { INote } from '../models/Note';
import { useNotes } from '../contexts/NotesContext';
import { notesAPI } from '../services/api';
import './Notes.css';

interface INoteFormData {
  title: string;
  content: string;
}

const emptyForm: INoteFormData = { title: '', content: '' };

const Notes: React.FC = () => {
  const { 
    notes, 
    loading, 
    error, 
    deleteNote,
    updateNote,
    createNote,
    setFilter,
    setSort,
    filter,
    sortBy,
    clearError,
    fetchNotes,
  } = useNotes();

  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<INote | null>(null);
  const [formData, setFormData] = useState<INoteFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sharingNoteId, setSharingNoteId] = useState<string | null>(null);
  const [shareUsername, setShareUsername] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q);
  });

  const openCreateForm = useCallback(() => {
    setEditingNote(null);
    setFormData(emptyForm);
    setShowForm(true);
  }, []);

  const openEditForm = useCallback((note: INote) => {
    setEditingNote(note);
    setFormData({ title: note.title, content: note.content });
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingNote(null);
    setFormData(emptyForm);
  }, []);

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    setSubmitting(true);
    try {
      if (editingNote) {
        await updateNote(editingNote.id, { title: formData.title.trim(), content: formData.content.trim() });
      } else {
        await createNote({ title: formData.title.trim(), content: formData.content.trim() });
      }
      closeForm();
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSubmitting(false);
    }
  }, [formData, editingNote, updateNote, createNote, closeForm]);

  const handleDeleteNote = useCallback(async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await deleteNote(noteId);
      clearError();
    } catch (err) {
      console.error('Delete error:', err);
    }
  }, [deleteNote, clearError]);

  const openShareDialog = useCallback((noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSharingNoteId(noteId);
    setShareUsername('');
    setShareMessage(null);
  }, []);

  const closeShareDialog = useCallback(() => {
    setSharingNoteId(null);
    setShareUsername('');
    setShareMessage(null);
  }, []);

  const handleShare = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareUsername.trim() || !sharingNoteId) return;
    setSharing(true);
    setShareMessage(null);
    try {
      await notesAPI.share(sharingNoteId, shareUsername.trim());
      setShareMessage('Note shared successfully!');
      setTimeout(closeShareDialog, 1500);
    } catch (err: any) {
      setShareMessage(err.response?.data || 'Failed to share note');
    } finally {
      setSharing(false);
    }
  }, [shareUsername, sharingNoteId, closeShareDialog]);

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
        <div className="notes-header-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input search-input"
            />
          </div>
          <button className="btn btn-primary" onClick={openCreateForm} type="button">
            + New Note
          </button>
        </div>
      </div>

      <div className="notes-toolbar">
        <div className="filter-group">
          {(['all', 'shared'] as const).map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(f)}
              type="button"
            >
              {f === 'all' ? 'All' : 'Shared'}
            </button>
          ))}
        </div>
        <div className="sort-group">
          <select
            className="form-input sort-select"
            value={sortBy}
            onChange={e => setSort(e.target.value as typeof sortBy)}
          >
            <option value="updated_desc">Last Updated</option>
            <option value="updated_asc">Oldest Updated</option>
            <option value="created_desc">Recently Created</option>
            <option value="created_asc">Oldest Created</option>
            <option value="title_asc">Title A-Z</option>
            <option value="title_desc">Title Z-A</option>
          </select>
        </div>
        <div className="note-count">
          {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
        </div>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
          <button className="btn btn-sm" onClick={clearError} type="button" style={{ marginLeft: 'auto', background: 'transparent', color: '#dc3545' }}>
            ✕
          </button>
        </div>
      )}

      <div className="notes-grid">
        {filteredNotes.length === 0 && !loading ? (
          <div className="no-notes">
            <h3>{searchQuery ? 'No matching notes' : 'No notes yet'}</h3>
            <p>{searchQuery ? 'Try a different search term.' : 'Create your first note to get started!'}</p>
            {!searchQuery && (
              <button className="btn btn-primary" onClick={openCreateForm} type="button" style={{ marginTop: '1rem' }}>
                + Create Note
              </button>
            )}
          </div>
        ) : (
          filteredNotes.map((note: INote) => (
            <div key={note.id} className="note-card" onClick={() => openEditForm(note)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && openEditForm(note)}>
              <div className="note-header">
                <h3 className="note-title">{note.title}</h3>
                <div className="note-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={(e) => openShareDialog(note.id, e)}
                    title="Share note"
                    type="button"
                  >
                    🔗
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={(e) => handleDeleteNote(note.id, e)}
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

      {showForm && (
        <div className="note-form-overlay" onClick={closeForm}>
          <div className="note-form" onClick={e => e.stopPropagation()}>
            <div className="note-form-header">
              <h2>{editingNote ? 'Edit Note' : 'New Note'}</h2>
              <button className="btn btn-sm btn-secondary" onClick={closeForm} type="button">✕</button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="note-title">Title</label>
                <input
                  id="note-title"
                  name="title"
                  className="form-input"
                  type="text"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Note title"
                  disabled={submitting}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="note-content">Content</label>
                <textarea
                  id="note-content"
                  name="content"
                  className="form-textarea"
                  value={formData.content}
                  onChange={handleFormChange}
                  placeholder="Write your note..."
                  disabled={submitting}
                  rows={6}
                />
              </div>
              <div className="form-actions">
                <button className="btn btn-secondary" type="button" onClick={closeForm} disabled={submitting}>
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit" disabled={submitting || !formData.title.trim() || !formData.content.trim()}>
                  {submitting ? 'Saving...' : editingNote ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {sharingNoteId && (
        <div className="note-form-overlay" onClick={closeShareDialog}>
          <div className="note-form share-form" onClick={e => e.stopPropagation()}>
            <div className="note-form-header">
              <h2>Share Note</h2>
              <button className="btn btn-sm btn-secondary" onClick={closeShareDialog} type="button">✕</button>
            </div>
            <form onSubmit={handleShare}>
              <div className="form-group">
                <label className="form-label" htmlFor="share-username">Username</label>
                <input
                  id="share-username"
                  name="username"
                  className="form-input"
                  type="text"
                  value={shareUsername}
                  onChange={e => setShareUsername(e.target.value)}
                  placeholder="Enter username to share with"
                  disabled={sharing}
                  autoFocus
                />
              </div>
              {shareMessage && (
                <div className={`share-message ${shareMessage === 'Note shared successfully!' ? 'share-success' : 'share-error'}`}>
                  {shareMessage}
                </div>
              )}
              <div className="form-actions">
                <button className="btn btn-secondary" type="button" onClick={closeShareDialog} disabled={sharing}>
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit" disabled={sharing || !shareUsername.trim()}>
                  {sharing ? 'Sharing...' : 'Share'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;

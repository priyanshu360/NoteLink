import React, { useState, useEffect } from 'react';
import './Notes.css';

const NoteForm = ({ note, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
      });
    }
  }, [note]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      setLoading(false);
      return;
    }

    try {
      await onSave(formData);
    } catch (err) {
      setError('Failed to save note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="note-form-overlay">
      <div className="note-form">
        <div className="note-form-header">
          <h2>{note ? 'Edit Note' : 'Create Note'}</h2>
          <button 
            className="btn btn-secondary" 
            onClick={onCancel}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter note title"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              className="form-textarea"
              value={formData.content}
              onChange={handleChange}
              placeholder="Enter note content"
              required
              disabled={loading}
              rows="10"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  {note ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                note ? 'Update Note' : 'Create Note'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;
// Note model for frontend
export class Note {
  constructor(data = {}) {
    this.id = data.id || '';
    this.userId = data.user_id || '';
    this.title = data.title || '';
    this.content = data.content || '';
    this.shared = data.shared || false;
    this.createdAt = data.created_at || new Date().toISOString();
    this.updatedAt = data.updated_at || new Date().toISOString();
    this.tags = data.tags || [];
    this.color = data.color || '#ffffff';
    this.isPinned = data.is_pinned || false;
  }

  // Get display title with fallback
  getDisplayTitle() {
    return this.title || 'Untitled Note';
  }

  // Get preview content
  getPreview(maxLength = 150) {
    if (!this.content) return 'No content';
    const plainText = this.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText;
  }

  // Get formatted date
  getFormattedDate(dateField = 'createdAt') {
    const date = new Date(this[dateField]);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Check if note was recently updated
  isRecentlyUpdated() {
    const now = new Date();
    const updated = new Date(this.updatedAt);
    const diffHours = (now - updated) / (1000 * 60 * 60);
    return diffHours < 1;
  }

  // Check if note is new
  isNew() {
    const now = new Date();
    const created = new Date(this.createdAt);
    const diffHours = (now - created) / (1000 * 60 * 60);
    return diffHours < 24;
  }

  // Get word count
  getWordCount() {
    if (!this.content) return 0;
    return this.content.trim().split(/\s+/).length;
  }

  // Get reading time (estimated)
  getReadingTime() {
    const wordsPerMinute = 200;
    const wordCount = this.getWordCount();
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes === 1 ? '1 min read' : `${minutes} min read`;
  }

  // Check if note is empty
  isEmpty() {
    return !this.title && !this.content;
  }

  // Check if note has been modified
  isModified() {
    const originalCreated = new Date(this.createdAt);
    const updated = new Date(this.updatedAt);
    return updated.getTime() > originalCreated.getTime();
  }

  // Serialize for API (create/update)
  toJSON() {
    return {
      title: this.title,
      content: this.content,
      shared: this.shared,
      tags: this.tags,
      color: this.color
    };
  }

  // Create note from API response
  static fromAPI(data) {
    return new Note({
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      content: data.content,
      shared: data.shared,
      created_at: data.created_at,
      updated_at: data.updated_at,
      tags: data.tags || [],
      color: data.color || '#ffffff',
      is_pinned: data.is_pinned || false
    });
  }

  // Create empty note
  static createEmpty() {
    return new Note({
      title: '',
      content: '',
      shared: false,
      tags: [],
      color: '#ffffff',
      is_pinned: false
    });
  }

  // Validate note data
  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (this.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    if (!this.content || this.content.trim().length === 0) {
      errors.push('Content is required');
    } else if (this.content.length > 10000) {
      errors.push('Content must be less than 10,000 characters');
    }

    if (this.tags && this.tags.length > 10) {
      errors.push('Maximum 10 tags allowed');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Search method - check if note matches query
  matches(query) {
    if (!query) return true;
    
    const searchTerm = query.toLowerCase();
    const title = this.title.toLowerCase();
    const content = this.content.toLowerCase();
    const tags = this.tags.map(tag => tag.toLowerCase()).join(' ');

    return title.includes(searchTerm) || 
           content.includes(searchTerm) || 
           tags.includes(searchTerm);
  }

  // Clone note with new ID (for duplication)
  clone() {
    const cloned = new Note(this.toJSON());
    cloned.id = '';
    cloned.title = `${this.title} (Copy)`;
    cloned.createdAt = new Date().toISOString();
    cloned.updatedAt = new Date().toISOString();
    return cloned;
  }
}

export default Note;
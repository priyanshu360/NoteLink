// Note model and interface definitions

// Note interface defining the structure
export interface INote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  shared: boolean;
  created_at: string;
  updated_at: string;
  tags?: string[];
  color?: string;
  is_pinned?: boolean;
}

// Note creation data interface
export interface INoteCreation {
  title: string;
  content: string;
  tags?: string[];
  color?: string;
  shared?: boolean;
  is_pinned?: boolean;
}

// Note update data interface
export interface INoteUpdate {
  title?: string;
  content?: string;
  tags?: string[];
  color?: string;
  shared?: boolean;
  is_pinned?: boolean;
}

// Note validation result interface
export interface INoteValidation {
  isValid: boolean;
  errors: string[];
}

// Note API response interface
export interface INoteResponse {
  note: INote;
  notes?: INote[];
  pagination?: INotePagination;
}

// Note pagination interface
export interface INotePagination {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Note sharing request interface
export interface INoteShareRequest {
  target_user_id: string;
}

// Note search filters interface
export interface INoteFilters {
  page?: number;
  limit?: number;
  sort?: 'updated_asc' | 'updated_desc' | 'created_asc' | 'created_desc' | 'title_asc' | 'title_desc';
  filter?: 'all' | 'shared' | 'recent' | 'pinned';
  tags?: string[];
  shared?: boolean;
}

// Note class implementing the interface
export class Note implements INote {
  id: string;
  userId: string;
  title: string;
  content: string;
  shared: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  color: string;
  isPinned: boolean;

  constructor(data: Partial<INote> = {}) {
    this.id = data.id || '';
    this.userId = data.user_id || '';
    this.title = data.title || '';
    this.content = data.content || '';
    this.shared = data.shared || false;
    this.createdAt = data.created_at ? new Date(data.created_at) : new Date();
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : new Date();
    this.tags = data.tags || [];
    this.color = data.color || '#ffffff';
    this.isPinned = data.is_pinned || false;
  }

  // Get display title with fallback
  getDisplayTitle(): string {
    return this.title || 'Untitled Note';
  }

  // Get preview content
  getPreview(maxLength: number = 150): string {
    if (!this.content) return 'No content';
    const plainText = this.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText;
  }

  // Get formatted date
  getFormattedDate(dateField: 'createdAt' | 'updatedAt' = 'createdAt'): string {
    const date = this[dateField];
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get relative time
  getRelativeTime(dateField: 'createdAt' | 'updatedAt' = 'updatedAt'): string {
    const now = new Date();
    const date = this[dateField];
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  }

  // Check if note was recently updated
  isRecentlyUpdated(): boolean {
    const now = new Date();
    const diffHours = (now.getTime() - this.updatedAt.getTime()) / (1000 * 60 * 60);
    return diffHours < 1;
  }

  // Check if note is new
  isNew(): boolean {
    const now = new Date();
    const diffHours = (now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  }

  // Get word count
  getWordCount(): number {
    if (!this.content) return 0;
    return this.content.trim().split(/\s+/).length;
  }

  // Get reading time (estimated)
  getReadingTime(): string {
    const wordsPerMinute = 200;
    const wordCount = this.getWordCount();
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes === 1 ? '1 min read' : `${minutes} min read`;
  }

  // Get character count
  getCharacterCount(): number {
    return this.content.length;
  }

  // Check if note is empty
  isEmpty(): boolean {
    return !this.title && !this.content;
  }

  // Check if note has been modified
  isModified(): boolean {
    return this.updatedAt.getTime() > this.createdAt.getTime();
  }

  // Get note color for UI
  getColor(): string {
    return this.color || '#ffffff';
  }

  // Set note color
  setColor(color: string): void {
    this.color = color;
  }

  // Toggle pin status
  togglePin(): void {
    this.isPinned = !this.isPinned;
  }

  // Add tag
  addTag(tag: string): void {
    if (!this.tags.includes(tag) && this.tags.length < 10) {
      this.tags.push(tag);
    }
  }

  // Remove tag
  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index > -1) {
      this.tags.splice(index, 1);
    }
  }

  // Validate note data
  validate(): INoteValidation {
    const errors: string[] = [];

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

    if (this.tags && this.tags.some(tag => tag.length > 50)) {
      errors.push('Each tag must be less than 50 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Search method - check if note matches query
  matches(query: string): boolean {
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
  clone(): Note {
    const cloned = new Note(this.toJSON());
    cloned.id = '';
    cloned.title = `${this.title} (Copy)`;
    cloned.createdAt = new Date();
    cloned.updatedAt = new Date();
    return cloned;
  }

  // Serialize for API (create/update)
  toAPI(): INoteCreation {
    return {
      title: this.title,
      content: this.content,
      tags: this.tags,
      color: this.color,
      shared: this.shared,
      is_pinned: this.isPinned
    };
  }

  // Serialize for update
  toUpdate(): INoteUpdate {
    return {
      title: this.title,
      content: this.content,
      tags: this.tags,
      color: this.color,
      shared: this.shared,
      is_pinned: this.isPinned
    };
  }

  // Create note from API response
  static fromAPI(data: INote): Note {
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
  static createEmpty(): Note {
    return new Note({
      title: '',
      content: '',
      shared: false,
      tags: [],
      color: '#ffffff',
      is_pinned: false
    });
  }

  // Get JSON representation
  toJSON(): INote {
    return {
      id: this.id,
      user_id: this.userId,
      title: this.title,
      content: this.content,
      shared: this.shared,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
      tags: this.tags,
      color: this.color,
      is_pinned: this.isPinned
    };
  }
}

export default Note;
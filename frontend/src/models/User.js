// User model for frontend
export class User {
  constructor(data = {}) {
    this.id = data.id || '';
    this.username = data.username || '';
    this.createdAt = data.created_at || new Date().toISOString();
    this.updatedAt = data.updated_at || new Date().toISOString();
  }

  // Get display name
  getDisplayName() {
    return this.username || 'Unknown User';
  }

  // Check if user is newly created
  isNew() {
    const now = new Date();
    const created = new Date(this.createdAt);
    const diffHours = (now - created) / (1000 * 60 * 60);
    return diffHours < 24;
  }

  // Serialize for API
  toJSON() {
    return {
      username: this.username,
      password: this.password // Only included for registration
    };
  }

  // Create user from API response
  static fromAPI(data) {
    return new User({
      id: data.id,
      username: data.username,
      created_at: data.created_at,
      updated_at: data.updated_at
    });
  }
}

export default User;
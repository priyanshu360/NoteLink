// User model and interface definitions

// User interface defining the structure
export interface IUser {
  id: string;
  username: string;
  created_at?: string;
  updated_at?: string;
}

// User API response interface
export interface IUserResponse {
  user: IUser;
  token?: string;
}

// User registration data interface
export interface IUserRegistration {
  username: string;
  password: string;
  confirmPassword?: string;
}

// User login credentials interface
export interface IUserCredentials {
  username: string;
  password: string;
}

// User class implementing the interface
export class User implements IUser {
  id: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IUser> = {}) {
    this.id = data.id || '';
    this.username = data.username || '';
    this.createdAt = data.created_at ? new Date(data.created_at) : new Date();
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : new Date();
  }

  // Get display name
  getDisplayName(): string {
    return this.username || 'Unknown User';
  }

  // Check if user is newly created
  isNew(): boolean {
    const now = new Date();
    const diffHours = (now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  }

  // Get user age in days
  getAgeInDays(): number {
    const now = new Date();
    const diffTime = now.getTime() - this.createdAt.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // Check if username is valid
  static isValidUsername(username: string): boolean {
    return (
      username.length >= 3 &&
      username.length <= 30 &&
      /^[a-zA-Z0-9_]+$/.test(username)
    );
  }

  // Check if password meets requirements
  static isValidPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Serialize for API registration
  toAPI(): IUserRegistration {
    return {
      username: this.username,
      password: (this as any).password // Only included for registration
    };
  }

  // Serialize for API login
  toCredentials(): IUserCredentials {
    return {
      username: this.username,
      password: (this as any).password // Only included for login
    };
  }

  // Create user from API response
  static fromAPI(data: IUser): User {
    return new User({
      id: data.id,
      username: data.username,
      created_at: data.created_at,
      updated_at: data.updated_at
    });
  }

  // Create empty user
  static createEmpty(): User {
    return new User();
  }

  // Get JSON representation (excluding sensitive data)
  toJSON(): IUser {
    return {
      id: this.id,
      username: this.username,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString()
    };
  }
}

export default User;
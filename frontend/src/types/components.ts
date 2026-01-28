// React component prop interfaces

// Base component props
export interface IBaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Loading component props
export interface ILoadingProps extends IBaseComponentProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

// Error component props
export interface IErrorProps extends IBaseComponentProps {
  error: string | IAPIError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

// Button component props
export interface IButtonProps extends IBaseComponentProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

// Input component props
export interface IInputProps extends IBaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
  name?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

// Form component props
export interface IFormProps extends IBaseComponentProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  autoComplete?: string;
  noValidate?: boolean;
}

// Card component props
export interface ICardProps extends IBaseComponentProps {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  elevation?: 'none' | 'small' | 'medium' | 'large';
  hover?: boolean;
}

// Modal component props
export interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
}

// Toast/Notification component props
export interface INotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Search component props
export interface ISearchProps extends IBaseComponentProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  debounceMs?: number;
  minQueryLength?: number;
  loading?: boolean;
  suggestions?: string[];
  showSuggestions?: boolean;
}

// Note component props
export interface INoteCardProps extends IBaseComponentProps {
  note: INote;
  onEdit?: (note: INote) => void;
  onDelete?: (note: INote) => void;
  onShare?: (note: INote) => void;
  onPin?: (note: INote) => void;
  showActions?: boolean;
  compact?: boolean;
  animated?: boolean;
}

// Note form component props
export interface INoteFormProps extends IBaseComponentProps {
  note?: INote;
  onSubmit: (note: INoteCreation) => void;
  onCancel: () => void;
  loading?: boolean;
  autoSave?: boolean;
  maxLength?: number;
  showPreview?: boolean;
}

// Pagination component props
export interface IPaginationProps extends IBaseComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit?: number;
  total?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  showPageNumbers?: boolean;
}

// Filter component props
export interface IFilterProps extends IBaseComponentProps {
  filter: string;
  options: Array<{ value: string; label: string }>;
  onFilterChange: (filter: string) => void;
  label?: string;
}

// Sort component props
export interface ISortProps extends IBaseComponentProps {
  sortBy: string;
  options: Array<{ value: string; label: string }>;
  onSortChange: (sortBy: string) => void;
  label?: string;
}

// User avatar component props
export interface IAvatarProps extends IBaseComponentProps {
  user: IUser;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  variant?: 'circle' | 'square' | 'rounded';
}

// Header/navigation component props
export interface IHeaderProps extends IBaseComponentProps {
  user?: IUser | null;
  onLogout?: () => void;
  onLogin?: () => void;
  showSearch?: boolean;
  title?: string;
  navigation?: Array<{
    label: string;
    href: string;
    active?: boolean;
  }>;
}

// Sidebar component props
export interface ISidebarProps extends IBaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  width?: number;
  position?: 'left' | 'right';
  overlay?: boolean;
}

// Import interfaces from models and API types
import { IUser } from '../models/User';
import { INote } from '../models/Note';
import { IAPIError } from '../models/APIResponse';
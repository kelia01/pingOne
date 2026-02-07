// frontend/src/types/index.ts

import type { Socket } from "socket.io-client";

// User types
export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
  socketId?: string;
}

export interface AuthUser extends Omit<User, 'lastSeen'> {
  token: string;
  lastSeen?: string;
}

// Message types
export interface Message {
  _id: string;
  sender: User;
  receiver: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  isGroup: boolean;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateUserStatus: (status: User['status']) => Promise<void>;
  isAuthenticated: boolean;
}

// Socket context types
export interface SocketContextType {
  socket: Socket | null;
  isUserOnline: (userId: string) => boolean;
  setOnlineUsers: React.Dispatch<React.SetStateAction<Set<string>>>;
}

// Form data types
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// API response types
export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: AuthUser;
}

// Component props types
export interface SidebarProps {
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
}

export interface MessageListProps {
  messages: Message[];
  typingUsers: TypingUser[];
}

export interface MessageInputProps {
  receiverId: string;
  onSendMessage: (content: string) => void;
  disabled: boolean;
}

export interface TypingUser {
  _id: string;
  username: string;
}

// API error type
export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}
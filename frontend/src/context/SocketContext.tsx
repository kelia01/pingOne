// frontend/src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import type { SocketContextType } from '../types';

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
          userId: user._id
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      setSocket(newSocket);

      // Handle user status changes
      newSocket.on('user_status_change', ({ userId, status }: { userId: string; status: string }) => {
        setOnlineUsers(prev => {
          const updated = new Set(prev);
          if (status === 'online') {
            updated.add(userId);
          } else {
            updated.delete(userId);
          }
          return updated;
        });
      });

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.has(userId);
  };

  const value: SocketContextType = {
    socket,
    isUserOnline,
    setOnlineUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
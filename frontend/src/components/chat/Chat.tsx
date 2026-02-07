// frontend/src/components/chat/Chat.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Sidebar from './Sidebar';
import ChatHeader from './ChatHeader'
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import toast from 'react-hot-toast';
import type { User, Message, TypingUser } from '../../types';

const Chat: React.FC = () => {
  useAuth();
  const { socket } = useSocket();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);

  // Fetch messages when user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle new messages
    socket.on('new_message', (message: Message) => {
      if (message.sender._id === selectedUser?._id) {
        setMessages(prev => [...prev, message]);
        // Mark as read
        socket.emit('mark_as_read', { messageId: message._id });
      }
    });

    // Handle message sent confirmation
    socket.on('message_sent', (message: Message) => {
      if (message.receiver === selectedUser?._id) {
        setMessages(prev => [...prev, message]);
      }
    });

    // Handle typing indicator
    socket.on('user_typing', ({ senderId, isTyping }: { senderId: string; isTyping: boolean }) => {
      if (senderId === selectedUser?._id) {
        setTypingUsers(prev => {
          if (isTyping) {
            return [...prev, { _id: senderId, username: selectedUser.username }];
          } else {
            return prev.filter(u => u._id !== senderId);
          }
        });
      }
    });

    // Handle message read confirmation
    socket.on('message_read', (message: Message) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === message._id ? { ...msg, status: 'read' } : msg
        )
      );
    });

    return () => {
      socket.off('new_message');
      socket.off('message_sent');
      socket.off('user_typing');
      socket.off('message_read');
    };
  }, [socket, selectedUser]);

  const fetchMessages = async (): Promise<void> => {
    if (!selectedUser) return;
    
    setLoadingMessages(true);
    try {
      // In a real app, you'd have an API endpoint for messages
      // For now, we'll simulate with socket
      setMessages([]); // Clear messages for new conversation
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = (content: string): void => {
    if (!selectedUser || !socket) return;

    socket.emit('private_message', {
      receiverId: selectedUser._id,
      content
    });
  };

  const handleSelectUser = (user: User): void => {
    setSelectedUser(user);
    setMessages([]);
    setTypingUsers([]);
  };

  return (
    <div className="flex h-screen bg-chat-bg text-white">
      <Sidebar selectedUser={selectedUser} onSelectUser={handleSelectUser} />
      
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <ChatHeader user={selectedUser} />
            <MessageList messages={messages} typingUsers={typingUsers} />
            <MessageInput
              receiverId={selectedUser._id}
              onSendMessage={handleSendMessage}
              disabled={loadingMessages}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to PingOne</h2>
              <p className="text-gray-400 mb-6">
                Select a user from the sidebar to start chatting. 
                Your messages are end-to-end encrypted and delivered in real-time.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>Online users</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                  <span>Real-time messaging</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Away status</span>
                </div>
                <div className="flex items-center">
                  <div className="flex space-x-1 mr-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dots"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dots animation-delay-150"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dots animation-delay-300"></div>
                  </div>
                  <span>Typing indicator</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
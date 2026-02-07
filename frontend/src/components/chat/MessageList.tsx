// frontend/src/components/chat/MessageList.tsx
import React, { useEffect, useRef, type JSX } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatTime } from '../../utils/helpers';
import { CheckIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import type { MessageListProps, Message } from '../../types';

const MessageList: React.FC<MessageListProps> = ({ messages, typingUsers }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const getMessageStatusIcon = (status: Message['status']): JSX.Element | null => {
    switch (status) {
      case 'delivered':
        return <CheckIcon className="w-4 h-4 text-blue-400" />;
      case 'read':
        return <CheckBadgeIcon className="w-4 h-4 text-green-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.sender._id === user?._id;
        
        return (
          <div
            key={message._id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2 ${
              isOwnMessage
                ? 'bg-chat-message.sent text-white rounded-tr-none'
                : 'bg-chat-message.received text-gray-900 rounded-tl-none'
            }`}>
              {!isOwnMessage && (
                <div className="flex items-center mb-1">
                  <img
                    src={message.sender.avatar}
                    alt={message.sender.username}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="text-xs font-semibold text-gray-700">
                    {message.sender.username}
                  </span>
                </div>
              )}
              <p className="text-sm">{message.content}</p>
              <div className={`flex items-center justify-end space-x-1 mt-1 ${
                isOwnMessage ? 'text-blue-200' : 'text-gray-500'
              }`}>
                <span className="text-xs">{formatTime(message.createdAt)}</span>
                {isOwnMessage && getMessageStatusIcon(message.status)}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Typing Indicators */}
      {typingUsers.length > 0 && (
        <div className="flex justify-start">
          <div className="bg-chat-message.received text-gray-900 rounded-2xl rounded-tl-none px-4 py-2">
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-typing-dots"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-typing-dots animation-delay-150"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-typing-dots animation-delay-300"></div>
              </div>
              <span className="text-xs text-gray-600">
                {typingUsers.map(u => u.username).join(', ')} is typing...
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
// frontend/src/components/chat/MessageInput.tsx
import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useSocket } from '../../context/SocketContext';
import type { MessageInputProps } from '../../types';

const MessageInput: React.FC<MessageInputProps> = ({ receiverId, onSendMessage, disabled }) => {
  const [message, setMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const { socket } = useSocket();

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      // Stop typing indicator
      socket?.emit('typing', { receiverId, isTyping: false });
      setIsTyping(false);
    }
  };

  const handleTyping = (e: ChangeEvent<HTMLInputElement>): void => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    
    // Start/stop typing indicator
    if (newMessage && !isTyping) {
      socket?.emit('typing', { receiverId, isTyping: true });
      setIsTyping(true);
    } else if (!newMessage && isTyping) {
      socket?.emit('typing', { receiverId, isTyping: false });
      setIsTyping(false);
    }
  };

  // Debounce typing indicator stop
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isTyping) {
      timer = setTimeout(() => {
        socket?.emit('typing', { receiverId, isTyping: false });
        setIsTyping(false);
      }, 2000); // Stop after 2 seconds of inactivity
    }
    return () => clearTimeout(timer);
  }, [message, isTyping, receiverId, socket]);

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-700 p-4">
      <div className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={handleTyping}
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
// frontend/src/components/chat/ChatHeader.tsx
import React from 'react';
import { PhoneIcon, VideoCameraIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import type { User } from '../../types';

interface ChatHeaderProps {
  user: User;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ user }) => {
  return (
    <div className="border-b border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-10 h-10 rounded-full"
          />
          <div className={`absolute bottom-0 right-0 w-3 h-3 ${
            user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
          } rounded-full border-2 border-chat-sidebar`} />
        </div>
        <div>
          <h2 className="font-semibold text-white">{user.username}</h2>
          <p className="text-sm text-gray-400 capitalize">
            {user.status === 'online' ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
          <PhoneIcon className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
          <VideoCameraIcon className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
          <EllipsisHorizontalIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
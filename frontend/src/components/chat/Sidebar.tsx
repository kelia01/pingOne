// frontend/src/components/chat/Sidebar.tsx
import React, { useState, useEffect, type ChangeEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';
import { getSmartLastSeen, getStatusColor } from '../../utils/helpers';
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import type { SidebarProps, User } from '../../types';

const Sidebar: React.FC<SidebarProps> = ({ selectedUser, onSelectUser }) => {
  const { user, logout } = useAuth();
  const { isUserOnline } = useSocket();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (): Promise<void> => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(userItem =>
    userItem.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearch(e.target.value);
  };

  const handleUserClick = (userItem: User): void => {
    onSelectUser(userItem);
  };

  return (
    <div className="w-80 bg-chat-sidebar border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={user?.avatar}
                alt={user?.username}
                className="w-10 h-10 rounded-full"
              />
              <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(user?.status || 'offline')} rounded-full border-2 border-chat-sidebar`} />
            </div>
            <div>
              <h2 className="font-semibold text-white">{user?.username}</h2>
              <p className="text-xs text-gray-400 capitalize">{user?.status}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="mt-4 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <UserCircleIcon className="w-12 h-12 mx-auto mb-2" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Online ({filteredUsers.filter(u => u.status === 'online').length})
            </div>
            {filteredUsers.map((userItem) => (
              <div
                key={userItem._id}
                onClick={() => handleUserClick(userItem)}
                className={`flex items-center p-3 hover:bg-gray-800 cursor-pointer transition-colors ${
                  selectedUser?._id === userItem._id ? 'bg-gray-800' : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={userItem.avatar}
                    alt={userItem.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 ${
                    userItem.status === 'online' || isUserOnline(userItem._id)
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  } rounded-full border-2 border-chat-sidebar`} />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-white">{userItem.username}</h3>
                    {userItem.lastSeen && (
                      <span className="text-xs text-gray-400">
                        {getSmartLastSeen(userItem.lastSeen)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 capitalize">
                    {userItem.status === 'online' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
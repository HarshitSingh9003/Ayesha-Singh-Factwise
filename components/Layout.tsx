import React from 'react';
import { User } from '../types';
import { LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">+</div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">MediTrack</span>
        </div>
        
        <div className="flex items-center space-x-6">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{user.role}</p>
            </div>
            <button 
                onClick={onLogout}
                className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                title="Logout"
            >
                <LogOut size={20} />
            </button>
        </div>
      </nav>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
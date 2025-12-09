import React from 'react';
import { User, Role } from '../types';
import { Stethoscope, UserCog, User as UserIcon } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  
  const handleLogin = (role: Role) => {
    // Simulating auth
    const userMap: Record<Role, User> = {
      nurse: { id: 'n1', name: 'Nurse Sarah', role: 'nurse', email: 'sarah@qtc.com' },
      doctor: { id: 'd1', name: 'Dr. Gregory House', role: 'doctor', email: 'house@qtc.com' },
      admin: { id: 'a1', name: 'Admin User', role: 'admin', email: 'admin@qtc.com' },
    };
    onLogin(userMap[role]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <div className="mb-8">
            <div className="w-16 h-16 bg-teal-600 rounded-xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg transform -rotate-6">
                <span className="text-3xl font-bold">+</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">MediTrack QTC</h1>
            <p className="text-gray-500 mt-2">Hospital Operations System</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => handleLogin('nurse')}
            className="w-full flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-teal-50 hover:border-teal-200 transition-all group"
          >
            <div className="bg-teal-100 p-2 rounded-lg text-teal-700 group-hover:bg-teal-200">
                <UserIcon size={24} />
            </div>
            <span className="font-semibold text-gray-700 group-hover:text-teal-800">Login as Nurse</span>
          </button>

          <button 
            onClick={() => handleLogin('doctor')}
            className="w-full flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group"
          >
            <div className="bg-blue-100 p-2 rounded-lg text-blue-700 group-hover:bg-blue-200">
                <Stethoscope size={24} />
            </div>
            <span className="font-semibold text-gray-700 group-hover:text-blue-800">Login as Doctor</span>
          </button>

          <button 
            onClick={() => handleLogin('admin')}
            className="w-full flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
          >
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700 group-hover:bg-indigo-200">
                <UserCog size={24} />
            </div>
            <span className="font-semibold text-gray-700 group-hover:text-indigo-800">Login as Admin</span>
          </button>
        </div>
        
        <p className="mt-8 text-xs text-gray-400">Prototype Build v1.0.0</p>
      </div>
    </div>
  );
};
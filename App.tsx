import React, { useState } from 'react';
import { User } from './types';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { NurseDashboard } from './components/NurseDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { AdminDashboard } from './components/AdminDashboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout user={currentUser} onLogout={handleLogout}>
      {currentUser.role === 'nurse' && <NurseDashboard user={currentUser} />}
      {currentUser.role === 'doctor' && <DoctorDashboard user={currentUser} />}
      {currentUser.role === 'admin' && <AdminDashboard user={currentUser} />}
    </Layout>
  );
};

export default App;
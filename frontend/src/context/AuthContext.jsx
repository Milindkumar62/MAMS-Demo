import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('mams_user');
    return raw ? JSON.parse(raw) : null;
  });

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('mams_token', data.token);
    localStorage.setItem('mams_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('mams_token');
    localStorage.removeItem('mams_user');
    setUser(null);
  }

  // Convenience helpers used throughout the UI to hide/show controls per role.
  const can = {
    recordPurchase: user && ['admin', 'logistics_officer'].includes(user.role),
    createTransfer: user && ['admin', 'logistics_officer', 'base_commander'].includes(user.role),
    manageAssignments: user && ['admin', 'base_commander'].includes(user.role),
    seeAllBases: user && ['admin', 'logistics_officer'].includes(user.role),
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

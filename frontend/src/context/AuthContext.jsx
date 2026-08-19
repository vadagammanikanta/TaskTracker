import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.getMe()
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    const handleLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = async (data) => {
    const res = await authApi.login(data);
    setUser(res.data.user);
    return res.data.user;
  };

  const signup = async (data) => {
    const res = await authApi.signup(data);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

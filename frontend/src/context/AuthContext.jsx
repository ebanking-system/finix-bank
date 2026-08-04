import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [jwt, setJwt] = useState(() => localStorage.getItem('jwt') || null);
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || null);
  const [userId, setUserId] = useState(() => localStorage.getItem('userId') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleUnauthorized = () => {
      setJwt(null);
      setUserRole(null);
      setUserId(null);
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, []);

  const login = (data) => {
    const { id, userRole: role, jwt: token } = data;
    setJwt(token);
    setUserRole(role);
    setUserId(id);

    if (token) localStorage.setItem('jwt', token);
    if (role) localStorage.setItem('userRole', role);
    if (id) localStorage.setItem('userId', id);
  };

  const logout = () => {
    setJwt(null);
    setUserRole(null);
    setUserId(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  };

  const value = {
    jwt,
    userRole,
    userId,
    isAuthenticated: Boolean(jwt),
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

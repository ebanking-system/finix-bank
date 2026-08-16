import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

/**
 * Validates whether a given JWT token is well-formed and unexpired.
 */
const isTokenExpired = (token) => {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch (e) {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [jwt, setJwt] = useState(() => {
    const token = localStorage.getItem('jwt');
    if (isTokenExpired(token)) {
      localStorage.removeItem('jwt');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      return null;
    }
    return token;
  });

  const [userRole, setUserRole] = useState(() => {
    const token = localStorage.getItem('jwt');
    if (isTokenExpired(token)) return null;
    return localStorage.getItem('userRole') || null;
  });

  const [userId, setUserId] = useState(() => {
    const token = localStorage.getItem('jwt');
    if (isTokenExpired(token)) return null;
    return localStorage.getItem('userId') || null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleUnauthorized = () => {
      setJwt(null);
      setUserRole(null);
      setUserId(null);
      localStorage.removeItem('jwt');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
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
    isAuthenticated: Boolean(jwt) && !isTokenExpired(jwt),
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

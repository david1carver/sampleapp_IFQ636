
// App entry point. AuthContext is defined INLINE here (rather than imported from a
// separate file) to guarantee there is exactly one context object - this prevents the
// "duplicate context instance" bug where children read from a different context object
// than the provider provides to.

import React, { createContext, useContext, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const AuthContext = createContext(null);
const STORAGE_KEY = 'mesa.auth';

function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const payload = decodeJwtPayload(parsed.token);
      return { ...parsed, role: payload?.role || 'diner' };
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  function login(data) {
    const payload = decodeJwtPayload(data.token);
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      token: data.token,
      role: payload?.role || 'diner',
    });
  }

  function logout() {
    setUser(null);
  }

  const value = {
    user,
    token: user?.token || null,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      login: () => {},
      logout: () => {},
    };
  }
  return ctx;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
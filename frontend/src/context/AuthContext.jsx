// frontend/src/context/AuthContext.jsx
// React Context that provides authentication state to the entire app tree.
// Stores user + token in localStorage so a page refresh doesn't log the user out.
// The token is a JWT signed by the backend, containing { id, role } in the payload.
//
// Maps to SysML R001-R006 (Signup, Authentication Process, Login, Logout, Session Termination).

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'mesa.auth';

function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  // user shape: { id, name, email, token, role }  (role decoded from JWT)
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Re-derive role from token in case the stored copy is stale.
      const payload = decodeJwtPayload(parsed.token);
      return { ...parsed, role: payload?.role || 'diner' };
    } catch (e) {
      return null;
    }
  });

  // Persist any change to user back to localStorage (or remove on logout).
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  function login(data) {
    // data shape from POST /api/auth/login: { id, name, email, token }
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
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Theme State: 'forest' (premium plant dark green) or 'midnight' (deep space indigo/slate dark mode)
  const [theme, setTheme] = useState(localStorage.getItem('app_theme') || 'forest');

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'forest' ? 'midnight' : 'forest');
  };

  // Check auth state on startup
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('cached_user');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('⚠️ Auth Server offline on start. Loading cached session if available.');
        const cachedUser = localStorage.getItem('cached_user');
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch (e) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('cached_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err; // Propagate the real error to the login screen!
    }
  };

  // Register handler
  const register = async (username, email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('cached_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err; // Propagate the real error to the signup screen!
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cached_user');
    setToken(null);
    setUser(null);
    window.location.hash = ''; // Clear route hash on logout
  };

  const updateProfile = async (username, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }
      
      const updatedUser = { ...user, username: data.username, email: data.email };
      localStorage.setItem('cached_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, error, login, register, logout, updateProfile, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

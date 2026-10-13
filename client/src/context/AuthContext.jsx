import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from '../config/api';

const AuthContext = createContext(null);

const readApiResponse = async (response, action) => {
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || `${action} failed (HTTP ${response.status}). Check that the Vercel API rewrite and Render service are available.`);
  if (!data) throw new Error(`${action} returned an invalid response. Check the Vercel API rewrite and Render service.`);
  return data || {};
};

const userFacingApiError = (error) => error instanceof TypeError
  ? `Could not reach the account service at ${API_URL}. Check the Vercel API rewrite and Render deployment.`
  : error.message;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const theme = 'soft-ui';

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
          const data = await readApiResponse(response, 'Session check');
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
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });
      
      const data = await readApiResponse(response, 'Login');
      
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
      setError(userFacingApiError(err));
      setIsLoading(false);
      throw new Error(userFacingApiError(err));
    }
  };

  // Register handler
  const register = async (username, email, password) => {
    setIsLoading(true);
    setError(null);
    const cleanUsername = username ? username.trim() : '';
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, email: cleanEmail, password })
      });
      
      const data = await readApiResponse(response, 'Registration');
      
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
      setError(userFacingApiError(err));
      setIsLoading(false);
      throw new Error(userFacingApiError(err));
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
    const cleanUsername = username ? username.trim() : '';
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: cleanUsername, email: cleanEmail, password })
      });
      
      const data = await readApiResponse(response, 'Profile update');
      
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
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, error, login, register, logout, updateProfile, theme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

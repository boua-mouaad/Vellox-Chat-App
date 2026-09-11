import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing login on page load and load user profile
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('vellox_jwt');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser({ ...response.data, token });
        } catch (error) {
          console.warn("Stored token invalid or expired:", error);
          localStorage.removeItem('vellox_jwt');
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await api.post('/auth/login', { identifier, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('vellox_jwt', token);

      if (userData) {
        setUser({ ...userData, token });
      } else {
        const meRes = await api.get('/auth/me');
        setUser({ ...meRes.data, token });
      }
      return true;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      return response.data;
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      const response = await api.post('/auth/verify-email', { email, code });
      return response.data;
    } catch (error) {
      console.error("Verification failed", error);
      throw error;
    }
  };

  const setAuthToken = async (token) => {
    localStorage.setItem('vellox_jwt', token);
    try {
      const response = await api.get('/auth/me');
      setUser({ ...response.data, token });
      return true;
    } catch (error) {
      console.error("Failed to load user with token", error);
      localStorage.removeItem('vellox_jwt');
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('vellox_jwt');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, verifyEmail, setAuthToken, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
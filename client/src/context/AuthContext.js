import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // Configurer axios avec le token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Vérifier l'authentification en récupérant le profil
          const response = await axios.get('/api/users/profile');

          if (response.data.success) {
            setCurrentUser(response.data.data);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
          localStorage.removeItem('token');
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/users/login', { email, password });

      if (response.data.success) {
        const { token, ...userData } = response.data.data;

        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setCurrentUser(userData);
        setIsAuthenticated(true);

        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur de connexion'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/users/register', userData);

      if (response.data.success) {
        const { token, ...userData } = response.data.data;

        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setCurrentUser(userData);
        setIsAuthenticated(true);

        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur d\'inscription'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put('/api/users/profile', userData);

      if (response.data.success) {
        const { token, ...updatedUserData } = response.data.data;

        if (token) {
          localStorage.setItem('token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        setCurrentUser(updatedUserData);

        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur de mise à jour du profil'
      };
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
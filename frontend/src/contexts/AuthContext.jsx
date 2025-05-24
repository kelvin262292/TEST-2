import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { setAuthToken } from '../services/api'; // Use the configured Axios instance

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(localStorage.getItem('token'));
  const [user, setUserState] = useState(JSON.parse(localStorage.getItem('user')));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // For storing login/registration errors

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (storedToken) {
      setAuthToken(storedToken); // Set token for current session API calls
      setTokenState(storedToken);
      if (storedUser) {
        setUserState(storedUser);
      } else {
        // If user is not in localStorage but token is, try to fetch user
        fetchUserProfile();
      }
    } else {
        // Ensure Axios default header is clear if no token
        setAuthToken(null);
    }
  }, []);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/auth/me');
      setUserState(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user profile or token invalid:', err);
      logout(); // Clear token and user data
      setError({ message: 'Session expired. Please log in again.', type: 'fetchProfile', originalError: err });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: apiToken, user: apiUser } = response.data;
      
      setTokenState(apiToken);
      setUserState(apiUser);
      setAuthToken(apiToken); // Sets for future Axios requests and saves to localStorage
      localStorage.setItem('user', JSON.stringify(apiUser)); // Save user to localStorage
      
      return apiUser;
    } catch (err) {
      console.error('Login failed:', err.response ? err.response.data : err.message);
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError({ message: errorMessage, type: 'login', originalError: err });
      logout(); // Ensure any partial state is cleared
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password, roles) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', { name, email, password, roles });
      // Assuming backend returns token and user upon successful registration, similar to login
      const { token: apiToken, user: apiUser } = response.data;

      setTokenState(apiToken);
      setUserState(apiUser);
      setAuthToken(apiToken);
      localStorage.setItem('user', JSON.stringify(apiUser));
      
      return apiUser; 
    } catch (err) {
      console.error('Registration failed:', err.response ? err.response.data : err.message);
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError({ message: errorMessage, type: 'register', originalError: err });
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setTokenState(null);
    setUserState(null);
    setAuthToken(null); // Clears from Axios defaults and localStorage token
    localStorage.removeItem('user'); // Explicitly remove user from localStorage
    setError(null);
  };

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchUserProfile,
    clearError: () => setError(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

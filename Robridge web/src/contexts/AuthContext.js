import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('robridge_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        localStorage.removeItem('robridge_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    try {
      const userInfo = {
        ...userData,
        loginTime: new Date().toISOString(),
        isAuthenticated: true
      };
      
      setUser(userInfo);
      localStorage.setItem('robridge_user', JSON.stringify(userInfo));
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  };

  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem('robridge_user');
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  };

  const isAuthenticated = () => {
    return user && user.isAuthenticated;
  };

  const getUserInfo = () => {
    return user;
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
    getUserInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

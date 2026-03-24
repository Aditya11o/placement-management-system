import React, { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<User>;
  verifyOTP: (email: string, otp: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: false,
  login: async () => {},
  register: async () => ({} as User),
  verifyOTP: async () => ({} as User),
  logout: () => {},
  refreshUser: async () => {},
} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<any>(null);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const { data } = await api.get('/profile/me');
      setProfile(data);
      // Sync names etc. if needed
      if (data.user && user && data.user.name !== user.name) {
        setUser({ ...user, name: data.user.name });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('userInfo', JSON.stringify(user));
      if (!profile) {
        fetchUserProfile();
      }
    } else {
      localStorage.removeItem('userInfo');
      setProfile(null);
    }
  }, [user]);

  // Initial profile fetch if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user && !profile) {
      fetchUserProfile();
    }
  }, []);

  const login = async (email: string, password: string): Promise<any> => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.requireOTP) {
        setLoading(false);
        return response.data; // { requireOTP: true, email: ... }
      }
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      setUser(response.data);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      setLoading(false);
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      setUser(response.data);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      setLoading(false);
      throw error.response?.data?.message || 'OTP verification failed';
    }
  };

  const register = async (userData: any): Promise<User> => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      setUser(response.data);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      setLoading(false);
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, verifyOTP, logout, refreshUser: fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

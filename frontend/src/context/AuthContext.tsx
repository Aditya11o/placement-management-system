import React, { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../api';
import type { User, ProfileData } from '../types';

interface AuthContextType {
  user: User | null;
  profile: ProfileData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: Record<string, any>) => Promise<User>;
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

// Helper: strip sensitive tokens before persisting user info to localStorage
const sanitizeUserForStorage = (data: any): User => {
  const { token, refreshToken, ...safeUser } = data;
  return safeUser as User;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const fetchInProgress = React.useRef(false);

  const fetchUserProfile = async () => {
    if (fetchInProgress.current) return;
    fetchInProgress.current = true;
    
    try {
      // Cookies are sent automatically via withCredentials — no localStorage check needed
      const { data } = await api.get('/profile/me');
      
      // Update profile state
      setProfile(data);
      
      // Selectively sync user info to prevent infinite loops
      if (data.user && user) {
        let changed = false;
        const newUserData = { ...user };
        
        if (data.user.name !== user.name) {
          newUserData.name = data.user.name;
          changed = true;
        }
        
        if (data.user.profilePhoto !== user.profilePhoto) {
          newUserData.profilePhoto = data.user.profilePhoto;
          changed = true;
        }
        
        if (changed) {
          setUser(newUserData);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // On error, we still clear the ref but we don't clear profile
      // to avoid the useEffect triggering another fetch immediately
      if (!profile) {
        setProfile({ _error: true }); // Marker to prevent immediate retry
      }
    } finally {
      fetchInProgress.current = false;
    }
  };

  // Synchronize user to localStorage only when user object changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('userInfo', JSON.stringify(user));
    } else {
      localStorage.removeItem('userInfo');
      setProfile(null);
    }
  }, [user]);

  // Initial and reactive profile fetch when user logs in
  useEffect(() => {
    if (user && !profile) {
      fetchUserProfile();
    }
  }, [user, profile]);

  const login = async (email: string, password: string): Promise<any> => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.requireOTP) {
        setLoading(false);
        return response.data; // { requireOTP: true, email: ... }
      }
      // Tokens are now set as httpOnly cookies by the backend.
      // Only store non-sensitive user info in localStorage for UI state.
      const safeUser = sanitizeUserForStorage(response.data);
      setUser(safeUser);
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
      const safeUser = sanitizeUserForStorage(response.data);
      setUser(safeUser);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      setLoading(false);
      throw error.response?.data?.message || 'OTP verification failed';
    }
  };

  const register = async (userData: Record<string, any>): Promise<User> => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', userData);
      const safeUser = sanitizeUserForStorage(response.data);
      setUser(safeUser);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      setLoading(false);
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const logout = async () => {
    try {
      // Call backend to clear httpOnly cookies
      await api.post('/auth/logout');
    } catch (err) {
      // Proceed with local cleanup even if API call fails
      console.error('Logout API call failed:', err);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, verifyOTP, logout, refreshUser: fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

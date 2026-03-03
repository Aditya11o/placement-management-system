import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize Auth state from token on load
    useEffect(() => {
        const initializeAuth = async () => {
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    // Check expiration
                    if (decoded.exp * 1000 < Date.now()) {
                        logout();
                    } else {
                        // Fetch fresh user profile details
                        const response = await api.get('/auth/me');
                        setUser({ ...response.data.data, role: decoded.role });
                    }
                } catch (error) {
                    console.error('Invalid token or failed to fetch user');
                    logout();
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, [token]);

    const login = async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        const { token: newToken, user: userData } = response.data;

        localStorage.setItem('token', newToken);
        setToken(newToken);

        // The role isn't explicitly returned in `/auth/login` body sometimes depending on backend logic,
        // so we decode it from the token to be certain.
        const decoded = jwtDecode(newToken);
        setUser({ ...userData, role: decoded.role });

        return decoded.role;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

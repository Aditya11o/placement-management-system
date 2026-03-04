import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (credentials: any) => Promise<string>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    // Initialize Auth state from token on load
    useEffect(() => {
        const initializeAuth = async () => {
            if (token) {
                try {
                    const decoded: any = jwtDecode(token);
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

    const login = async (credentials: any): Promise<string> => {
        const response = await api.post('/auth/login', credentials);
        const { token: newToken, user: userData } = response.data;

        localStorage.setItem('token', newToken);
        setToken(newToken);

        // The role isn't explicitly returned in `/auth/login` body sometimes depending on backend logic,
        // so we decode it from the token to be certain.
        const decoded: any = jwtDecode(newToken);
        setUser({ ...userData, role: decoded.role });

        return decoded.role;
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

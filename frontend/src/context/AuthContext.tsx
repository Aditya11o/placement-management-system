import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import api, { setTenantId } from '../services/api';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (credentials: any) => Promise<{ role: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token') || sessionStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const logout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setTenantId(null);
    };

    // Initialize Auth state from token on load
    useEffect(() => {
        const initializeAuth = async () => {
            const currentToken = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (currentToken) {
                try {
                    const decoded: any = jwtDecode(currentToken);
                    // Check expiration with 30s buffer to prevent mid-request expiry
                    if (decoded.exp * 1000 < Date.now() + 30000) {
                        logout();
                    } else {
                        // Fetch fresh user profile details
                        const response = await api.get('/auth/me');
                        const userData = response.data.data;
                        const newUser = { ...userData, role: decoded.role };

                        // Update global tenant ID for API requests
                        if (userData.college_id) {
                            setTenantId(userData.college_id.toString());
                        }

                        // Only update if something actually changed to avoid downstream re-renders
                        setUser(prev => {
                            if (prev && JSON.stringify(prev) === JSON.stringify(newUser)) return prev;
                            return newUser;
                        });
                        setToken(currentToken);
                    }
                } catch (error: any) {
                    console.error('Initialization error:', error.message);
                    // Only logout if it's explicitly an Auth error (401)
                    // or if the token was fatally invalid (handled by jwtDecode above)
                    if (error.response?.status === 401) {
                        logout();
                    }
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const login = async (credentials: any): Promise<{ role: string }> => {
        const response = await api.post('/auth/login', credentials);
        const { token: newToken, user: userData } = response.data;
        const { rememberMe } = credentials;

        if (rememberMe) {
            localStorage.setItem('token', newToken);
        } else {
            sessionStorage.setItem('token', newToken);
        }
        
        setToken(newToken);

        const decoded: any = jwtDecode(newToken);
        setUser({ ...userData, role: decoded.role });

        if (userData.college_id) {
            setTenantId(userData.college_id.toString());
        }

        return { role: decoded.role };
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

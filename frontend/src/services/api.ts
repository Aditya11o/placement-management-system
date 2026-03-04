import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

// --- Request Interceptor ---
// Attach the JWT token from localStorage to every outbound request.
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// --- Response Interceptor (runtime-injectable) ---
// We use a holder pattern so App.tsx can inject real React callbacks
// after the component tree mounts, avoiding circular imports.
type InterceptorCallbacks = {
    onUnauthenticated: () => void;
};

let _callbacks: InterceptorCallbacks | null = null;

/**
 * Call this once from inside the React component tree (after providers mount)
 * to wire up the 401 response handler with access to AuthContext and QueryClient.
 */
export const setupInterceptors = (callbacks: InterceptorCallbacks) => {
    _callbacks = callbacks;
};

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            if (_callbacks) {
                // Delegate to the injected handler  — it has access to
                // queryClient.clear(), logout(), and addToast().
                _callbacks.onUnauthenticated();
            } else {
                // Fallback for very early requests (before React mounts)
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

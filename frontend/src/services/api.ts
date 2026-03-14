import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

let _tenantId: string | null = null;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Update the global tenant ID used for all outbound requests.
 * Called by AuthProvider when a user logs in.
 */
export const setTenantId = (id: string | null) => {
    _tenantId = id;
};

// --- Request Interceptor ---
// Attach the JWT token and Tenant ID to every outbound request.
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Inject the X-College-Id header for multi-tenancy scoping
        if (_tenantId && config.headers) {
            config.headers['X-College-Id'] = _tenantId;
        }

        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// --- Response Interceptor (runtime-injectable) ---
type InterceptorCallbacks = {
    onUnauthenticated: () => void;
};

let _callbacks: InterceptorCallbacks | null = null;

export const setupInterceptors = (callbacks: InterceptorCallbacks) => {
    _callbacks = callbacks;
};

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            if (_callbacks) {
                _callbacks.onUnauthenticated();
            } else {
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

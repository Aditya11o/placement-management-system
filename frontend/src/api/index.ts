import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Helper: read a cookie by name
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Sends httpOnly cookies (token, refreshToken) automatically
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach CSRF token from cookie to header (Double Submit Cookie pattern)
    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken && config.headers) {
      config.headers['x-csrf-token'] = csrfToken;
    }

    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response interceptor to handle token refresh on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Request backend to refresh the access token via httpOnly cookie
        await axios.post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true });
        
        // Retry the original failed request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (e.g. refresh token expired), clear state by redirecting to login
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

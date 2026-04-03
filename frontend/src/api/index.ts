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

export default api;

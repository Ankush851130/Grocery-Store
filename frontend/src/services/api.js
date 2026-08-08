import axios from 'axios';

export const TOKEN_STORAGE_KEYS = {
  accessToken: 'grocery_access_token',
  refreshToken: 'grocery_refresh_token',
};

const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_BASE_URL;
  if (url) {
    if (url.startsWith('hhttps://')) {
      url = url.replace(/^h+ttps:\/\//, 'https://');
    }
    return url;
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEYS.accessToken);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const storedRefreshToken = localStorage.getItem(TOKEN_STORAGE_KEYS.refreshToken);

        const refreshResponse = await axios.post(
          `${getApiBaseUrl()}/auth/refresh-token`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        const newRefreshToken = refreshResponse.data?.data?.refreshToken;

        if (newAccessToken) {
          localStorage.setItem(TOKEN_STORAGE_KEYS.accessToken, newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem(TOKEN_STORAGE_KEYS.refreshToken, newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem(TOKEN_STORAGE_KEYS.accessToken);
        localStorage.removeItem(TOKEN_STORAGE_KEYS.refreshToken);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

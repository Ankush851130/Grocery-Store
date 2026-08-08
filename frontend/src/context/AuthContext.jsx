import { createContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';
import { TOKEN_STORAGE_KEYS } from '../services/api';

const AuthContext = createContext(null);

const normalizeApiError = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Something went wrong'
  );
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const response = await authService.getCurrentUser();
        setUser(response.data?.data?.user || null);
      } catch (requestError) {
        setUser(null);
        localStorage.removeItem(TOKEN_STORAGE_KEYS.accessToken);
        localStorage.removeItem(TOKEN_STORAGE_KEYS.refreshToken);
      } finally {
        setIsLoading(false);
      }
    };

    hydrateSession();
  }, []);

  const register = async (payload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register(payload);
      const { user: nextUser, accessToken, refreshToken } = response.data?.data || {};

      if (accessToken) {
        localStorage.setItem(TOKEN_STORAGE_KEYS.accessToken, accessToken);
      }
      if (refreshToken) {
        localStorage.setItem(TOKEN_STORAGE_KEYS.refreshToken, refreshToken);
      }

      setUser(nextUser || null);
      return response.data;
    } catch (requestError) {
      const message = normalizeApiError(requestError);
      setError(message);
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (payload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(payload);
      const { user: nextUser, accessToken, refreshToken } = response.data?.data || {};

      if (accessToken) {
        localStorage.setItem(TOKEN_STORAGE_KEYS.accessToken, accessToken);
      }
      if (refreshToken) {
        localStorage.setItem(TOKEN_STORAGE_KEYS.refreshToken, refreshToken);
      }

      setUser(nextUser || null);
      return response.data;
    } catch (requestError) {
      const message = normalizeApiError(requestError);
      setError(message);
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.logout();
    } catch (requestError) {
      setError(normalizeApiError(requestError));
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEYS.accessToken);
      localStorage.removeItem(TOKEN_STORAGE_KEYS.refreshToken);
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const response = await authService.getCurrentUser();
      const nextUser = response.data?.data?.user || null;
      setUser(nextUser);
      return nextUser;
    } catch (requestError) {
      setUser(null);
      throw requestError;
    }
  };

  const updateProfile = async (payload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.updateProfile(payload);
      const nextUser = response.data?.data?.user || null;
      setUser(nextUser);
      return response.data;
    } catch (requestError) {
      const message = normalizeApiError(requestError);
      setError(message);
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (payload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.changePassword(payload);
      return response.data;
    } catch (requestError) {
      const message = normalizeApiError(requestError);
      setError(message);
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = useMemo(() => {
    return {
      user,
      isLoading,
      error,
      isAuthenticated: Boolean(user),
      register,
      login,
      logout,
      refreshSession,
      updateProfile,
      changePassword,
      clearError,
    };
  }, [user, isLoading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;

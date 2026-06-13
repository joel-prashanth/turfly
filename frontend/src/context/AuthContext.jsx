import { createContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/authApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initializeAuth = async () => {
  try {
    const response = await authApi.getCurrentUser();
    setUser(response.user);
  } catch (error) {
    // Guest user (no active session)
    if (error.response?.status !== 401) {
      console.error("Failed to initialize auth:", error);
    }

    setUser(null);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authApi.login(email, password);

    const user = response.user;

    setUser(user);

    return user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      refreshUser: initializeAuth,
      setUser,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

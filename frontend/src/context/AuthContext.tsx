import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { authService } from "../services/authService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  loginAsDemo: (role: "patient" | "doctor") => Promise<User>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("curapulse_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("curapulse_token");
      if (savedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (error) {
          console.error("Auth initialization failed:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData: User, authToken: string) => {
    localStorage.setItem("curapulse_token", authToken);
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("curapulse_token");
    setToken(null);
    setUser(null);
  };

  const loginAsDemo = async (role: "patient" | "doctor"): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.demoLogin(role);
      if (res.success && res.token && res.user) {
        login(res.user, res.token);
        return res.user;
      }
      throw new Error(res.message || "Demo login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        loginAsDemo,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

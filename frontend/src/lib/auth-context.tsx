"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { api } from "@/lib/api";

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string;
  preferred_language: string;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
    fullName?: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("gs_token");
    if (savedToken) {
      setToken(savedToken);
      api
        .getMe()
        .then((u) => setUser(u))
        .catch(() => {
          localStorage.removeItem("gs_token");
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem("gs_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (
      email: string,
      username: string,
      password: string,
      fullName?: string
    ) => {
      const res = await api.register({
        email,
        username,
        password,
        full_name: fullName,
      });
      localStorage.setItem("gs_token", res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("gs_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

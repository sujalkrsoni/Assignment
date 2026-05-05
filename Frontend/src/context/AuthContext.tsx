import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { api, extractErrorMessage } from "../lib/api";
import { disconnectSocket } from "../lib/socket";
import { storage } from "../lib/storage";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  updateProfileImage: (imageUrl: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const parseInitialUser = (): AuthUser | null => {
  const rawUser = storage.getUser();
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    storage.clearUser();
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(storage.getToken());
  const [user, setUser] = useState<AuthUser | null>(parseInitialUser);

  const setAuthState = useCallback((authData: AuthResponse) => {
    setToken(authData.token);
    setUser(authData.user);
    storage.setToken(authData.token);
    storage.setUser(JSON.stringify(authData.user));
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      try {
        const response = await api.post<{
          success: boolean;
          data: AuthResponse;
        }>("/login", payload);

        setAuthState(response.data.data);
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    },
    [setAuthState]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      try {
        await api.post("/users", payload);
        await login({ email: payload.email, password: payload.password });
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    },
    [login]
  );

  const updateProfileImage = useCallback(
    async (imageUrl: string) => {
      if (!user) {
        throw new Error("Authentication required");
      }

      try {
        const response = await api.patch<{ success: boolean; data: AuthUser }>(
          `/users/${user.id}`,
          { imageUrl }
        );
        const updatedUser = response.data.data;
        setUser(updatedUser);
        storage.setUser(JSON.stringify(updatedUser));
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    },
    [user]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    storage.clearAuth();
    disconnectSocket();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      updateProfileImage,
      logout,
    }),
    [user, token, login, register, updateProfileImage, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

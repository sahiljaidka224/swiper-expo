import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

export interface CurrentUser {
  name: string;
  id: string;
  phoneNumber: string;
  profileComplete: boolean;
  org?: {
    id: string;
    name: string;
  };
}

interface AuthContextType {
  token: string | null;
  user: CurrentUser | null;
  isAuthLoading: boolean;
  login: (token: string, user: CurrentUser) => void;
  updateUser: (user: CurrentUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<CurrentUser | null>(null);
  const [isAuthLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAuthData = async () => {
      const storedToken = await SecureStore.getItemAsync("authToken");
      const storedUserInfo = await SecureStore.getItemAsync("user");
      if (storedToken && storedUserInfo) {
        setToken(storedToken);
        try {
          const parsedUserInfo: CurrentUser | null = JSON.parse(storedUserInfo);
          if (parsedUserInfo) setUserInfo(parsedUserInfo);
        } catch (error) {}
      }
      setLoading(false);
    };

    loadAuthData();
  }, []);

  const login = async (authToken: string, user: CurrentUser) => {
    setToken(authToken);
    setUserInfo(user);

    await SecureStore.setItemAsync("authToken", authToken);
    await SecureStore.setItemAsync("user", JSON.stringify(user));
  };

  const logout = async () => {
    setToken(null);
    setUserInfo(null);

    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync("user");
  };

  const updateUser = async (user: CurrentUser) => {
    setUserInfo(user);

    await SecureStore.setItemAsync("user", JSON.stringify(user));
  };

  return (
    <AuthContext.Provider
      value={{ token, user: userInfo, isAuthLoading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

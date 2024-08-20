import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

interface User {
  name: string;
  id: string;
  phoneNumber: string;
  profileComplete: boolean;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [isAuthLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAuthData = async () => {
      const storedToken = await SecureStore.getItemAsync("authToken");
      const storedUserInfo = await SecureStore.getItemAsync("username");
      if (storedToken && storedUserInfo) {
        setToken(storedToken);
        try {
          const parsedUserInfo: User | null = JSON.parse(storedUserInfo);
          if (parsedUserInfo) setUserInfo(parsedUserInfo);
        } catch (error) {}
      }
      setLoading(false);
    };

    loadAuthData();
  }, []);

  const login = async (authToken: string, user: User) => {
    setToken(authToken);
    setUserInfo(user);

    await SecureStore.setItemAsync("authToken", authToken);
    await SecureStore.setItemAsync("username", JSON.stringify(user));
  };

  const logout = async () => {
    setToken(null);
    setUserInfo(null);

    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync("username");
  };

  return (
    <AuthContext.Provider value={{ token, user: userInfo, isAuthLoading, login, logout }}>
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

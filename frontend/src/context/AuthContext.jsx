import React, { createContext, useState, useEffect, useContext } from "react";
import { verifyOTP } from "../services/auth";
import { apiCall } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate session on startup
    const verifySession = async () => {
      if (token) {
        try {
          const profile = await apiCall("/profile", "GET", null, token);
          setUser(profile);
        } catch (err) {
          console.error("Session verification failed. Logging out.", err);
          handleLogout();
        }
      }
      setLoading(false);
    };
    verifySession();
  }, [token]);

  const handleLogin = async (email, otp) => {
    try {
      const response = await verifyOTP(email, otp);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      console.error("Login verification failed:", error);
      throw error;
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    login: handleLogin,
    logout: handleLogout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

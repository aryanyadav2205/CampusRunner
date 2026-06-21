import React, { createContext, useState, useContext } from "react";
import { apiCall } from "../services/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [profileCache, setProfileCache] = useState({});

  const fetchPublicProfile = async (userId) => {
    // Return cached if available
    if (profileCache[userId]) {
      return profileCache[userId];
    }

    try {
      const profile = await apiCall(`/profile/${userId}`, "GET");
      setProfileCache((prev) => ({
        ...prev,
        [userId]: profile,
      }));
      return profile;
    } catch (error) {
      console.error(`Failed to fetch user profile for ID ${userId}:`, error);
      throw error;
    }
  };

  const value = {
    fetchPublicProfile,
    profileCache,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUsers() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
}

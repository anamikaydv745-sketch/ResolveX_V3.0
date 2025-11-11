import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

// Define the shape of the user object
interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

// Define the shape of the context
interface AuthContextType {
  user: UserProfile | null;
  login: (accessToken: string) => Promise<void>;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Check localStorage for a saved user session on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("userProfile");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login function
  const login = async (accessToken: string) => {
    try {
      // Use the access token to get user info from Google
      const res = await axios.get(
        "https://www.googleapis.com/oauth2/v1/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const profile: UserProfile = res.data;
      setUser(profile);
      // Save user session to localStorage
      localStorage.setItem("userProfile", JSON.stringify(profile));
    } catch (err) {
      console.error("Failed to fetch user info", err);
      logout(); // Clear any partial state
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    // Clear user session from localStorage
    localStorage.removeItem("userProfile");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
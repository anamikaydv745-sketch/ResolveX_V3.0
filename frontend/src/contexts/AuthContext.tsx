import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
// Create the context outside the component
const AuthContext = createContext<AuthContextType | undefined>(undefined);



// Define the shape of the user object
interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

// Define the shape of the context
interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null; // <-- Add this line
  login: (accessToken: string) => Promise<void>;
  logout: () => void;
}


// Define the AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  // Check localStorage for a saved user session on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("userProfile");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    // NEW: restore accessToken if present
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setAccessToken(storedToken);
    }
  }, []);
  

  // Login function
  const login = async (token: string) => {
    setAccessToken(token); // store in state
    localStorage.setItem("accessToken", token); // persist in localStorage
    try {
      const res = await axios.get(
        "https://www.googleapis.com/oauth2/v1/userinfo",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const profile: UserProfile = res.data;
      setUser(profile);
      localStorage.setItem("userProfile", JSON.stringify(profile));
    } catch (err) {
      console.error("Failed to fetch user info", err);
      logout();
    }
  };
  

  // Logout function
  const logout = () => {
    setUser(null);
    setAccessToken(null); // clear token
    localStorage.removeItem("userProfile");
    localStorage.removeItem("accessToken"); // clear token
  };
  

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
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
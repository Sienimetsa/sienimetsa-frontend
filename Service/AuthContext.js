import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import AuthService from "./AuthService";  
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        if (token) {
          const decoded = jwtDecode(token);
          console.log("Decoded Token:", decoded); // Debug decoded token
          const userData = { email: decoded.sub, u_id: decoded.uId || null };
          setUser(userData);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading user:", error);
        setLoading(false);
      }
    };
  
    loadUser();
  }, []);

 const login = async (email, password) => {
  try {
    const userData = await AuthService.login(email, password);
    console.log("User data returned from AuthService:", userData); // Debug
    if (userData) {
      setUser(userData); // Set the user state in the AuthProvider
      console.log("User data set after login:", userData); // Debug
      return true;
    }
    return false;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
};

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("jwtToken");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

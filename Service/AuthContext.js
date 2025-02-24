import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import AuthService from "./AuthService";
import axios from 'axios';
import { Alert } from 'react-native'; 
import { API_BASE_URL } from "@env";  

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
        try {
            const token = await AsyncStorage.getItem("jwtToken");
            console.log("Token retrieved from AsyncStorage:", token); // Debugging

            if (token) {
                const decoded = jwtDecode(token);
                console.log("Decoded Token:", decoded); // Debugging
                const userData = { email: decoded.sub || null };

                if (userData.email) {
                    setUser(userData); // Update user state only if email exists
                    console.log("User data set:", userData); // Debugging user data set
                }
            }
            setLoading(false); // Set loading to false when token processing is done
        } catch (error) {
            console.error("Error loading user:", error);
            setLoading(false);
        }
    };

    loadUser();
}, []); // Only runs once when component mounts

  
  const deleteAccount = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        return false;
      }

      const email = user?.email;
      if (!email) {
        Alert.alert("Error", "No email found. Cannot delete account.");
        return false;
      }

      const response = await axios.delete(`${API_BASE_URL}/api/profile/delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { email },
      });

      if (response.status === 200) {
        console.log("Account deleted successfully.");
        Alert.alert("Account deleted successfully.");
        return true;
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      Alert.alert("Failed to delete account.");
    }
    return false;
  };

  const login = async (email, password) => {
    try {
      const userData = await AuthService.login(email, password);
      console.log("User data returned from AuthService:", userData); // Debugging
      if (userData) {
        setUser(userData);
        console.log("User logged in:", userData);
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
      console.log("User logged out.");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

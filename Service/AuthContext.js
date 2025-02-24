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


// fetch user data on token change
  useEffect(() => {
    const reloadUserOnTokenChange = async () => {
        const token = await AsyncStorage.getItem("jwtToken");
        if (token) {
            const decoded = jwtDecode(token);
            setUser({ email: decoded.sub || null });
        } else {
            setUser(null);
        }
        setLoading(false);
    };

    const interval = setInterval(reloadUserOnTokenChange, 1000); // Check token every 5 seconds
    return () => clearInterval(interval);
}, []);



  const deleteAccount = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken"); // Get token from AsyncStorage
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        return false;
      }

      const email = user?.email;
      if (!email) {
        Alert.alert("Error", "No email found. Cannot delete account.");
        return false;
      }

      const response = await axios.delete(`${API_BASE_URL}/api/profile/delete`, { //  Send a DELETE request to the server
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
      await AsyncStorage.clear();
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

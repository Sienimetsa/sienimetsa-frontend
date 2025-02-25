
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import AuthService from "./AuthService";
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASE_URL } from "@env";  

// Creates a context to hold global state for user data, login/logout functions, etc.)
export const AuthContext = createContext(); //  'AuthContext' is the object that holds the authentication state

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // stores user information that can be used around the app. For example: user.email and use.usernam
  const [loading, setLoading] = useState(true); //  State to track if the app is still loading user data

  // Helper function to get token from AsyncStorage
  const getToken = async () => {
    return await AsyncStorage.getItem("jwtToken");
  };

  // Effect to check the user's authentication status when the component mounts
  useEffect(() => {
    const checkTokenAndSetUser = async () => {
      const token = await getToken();
      // If there's a token, decode it to get the user data
      if (token) {
        const decoded = jwtDecode(token); // Decodes the token to get user data
        setUser({ email: decoded.sub || null ,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkTokenAndSetUser(); // Initial check when the component mounts
  }, []); // Empty array ensures this effect runs once when the component mounts


   // DELETE: Function to delete a user's account from the backend
  const deleteAccount = async () => {
    try {
      const token = await getToken(); // Get the stored token to authenticate the request
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        return false;
      }

      const email = user?.email; // Get the email from the user object
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

  // Login function
  const login = async (email, password) => {
    try {
      const userData = await AuthService.login(email, password); // Calls AuthService login function
      console.log("User data returned from AuthService:", userData); 
      if (userData) {
        setUser(userData); // Set the user data in the state
        console.log("User logged in:", userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.clear();
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



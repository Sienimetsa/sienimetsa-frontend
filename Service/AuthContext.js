import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { Alert } from 'react-native';
import { API_MOBILE_LOGIN, API_MOBILE_SIGNUP, API_PROFILE_DELETE } from "@env";

// Creates a context to hold global state for user data, login/logout functions, etc.
export const AuthContext = createContext(); // 'AuthContext' holds the authentication state

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // stores user information that can be used around the app
  const [loading, setLoading] = useState(true); // Tracks if the app is still loading user data

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
        setUser({ email: decoded.sub || null });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkTokenAndSetUser(); // Initial check when the component mounts
  }, []); // Empty array ensures this effect runs once when the component mounts



  // LOGIN: Function to handle user login
  const login = async (email, password) => {
    try {
      // Make a POST request to the login endpoint with email and password
      const response = await axios.post(`${API_MOBILE_LOGIN}`, { email, password });

      // If the response contains a token, store it in AsyncStorage
      if (response.data.token) {
        await AsyncStorage.setItem("jwtToken", response.data.token);
        console.log("Token stored in AsyncStorage:", response.data.token);

        const decoded = jwtDecode(response.data.token); // Decode token
        console.log("Decoded Token:", decoded);

        const userData = { email: decoded.sub }; // Prepare user data from decoded token
        setUser(userData); // Set user data in context

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // SIGNUP: Function to handle user signup
  const signup = async ({
    username,
    password,
    phone,
    email,
    country,
    chatColor,
    profilePicture,
    dryRun = false,
  }) => {
    try {
      const response = await axios.post(`${API_MOBILE_SIGNUP}`, {
        username,
        password,
        phone,
        email,
        country,
        chatColor,
        profilePicture,
        dryRun,
      });

      if (response.status === 201) {
        return true;
      } else {
        console.error("Signup failed");
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      throw error;
    }
  };


  // DELETE ACCOUNT: Function to delete a user's account from the backend
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

      const response = await axios.delete(`${API_PROFILE_DELETE}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { email },
      });

      if (response.status === 200) {
        console.log("Account deleted successfully.");
        return true;
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      Alert.alert("Failed to delete account.");
    }
    return false;
  };

  // LOGOUT: Function to log the user out
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
    <AuthContext.Provider value={{ user, setUser, login, logout, signup, loading, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { jwtDecode } from "jwt-decode";

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mobile/login`, { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem("jwtToken", response.data.token);
      console.log("Token stored in AsyncStorage:", response.data.token); // Debug token storage

      const decoded = jwtDecode(response.data.token);
      console.log("Decoded Token:", decoded); // Debug decoded token

      const userData = { email: decoded.sub }; 
       // Only store the email
      return userData; // Return user data instead of setting it here
    }
    return null; // Return null if no token is found
  } catch (error) {
    console.error("Login error:", error);
    throw error; // Throw the error to handle it in the AuthProvider
  }
};

const signup = async (username, password, phone, email, country, chatColor, profilePicture ) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mobile/signup`, {
      username,
      password,
      phone,
      email,
      country,
      chatColor,
      profilePicture,
    });

    if (response.status === 201) {
      console.log("Signup successful");
      return true;
    } else {
      console.error("Signup failed");
      return false;
    }
  } catch (error) {
    console.error("Error during signup:", error);
    throw error;
  }
};

const deleteUserAccount = async (email) => {
  try {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
      console.error("No token found, cannot delete account");
      return { success: false, message: "No authentication token" };
    }

    if (!email) {
      console.error("No user ID provided, cannot delete account");
      return { success: false, message: "Missing user ID" };
    }

    const response = await axios.delete(`${API_BASE_URL}/api/profile/delete/${email}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error.response?.data || error.message);
    return { success: false, message: "Server error" };
  }
};

export default {
  login,
  signup,
  deleteUserAccount
};

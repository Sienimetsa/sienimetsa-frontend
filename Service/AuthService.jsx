import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { jwtDecode } from "jwt-decode";


// Function to handle user login
const login = async (email, password) => {
  try {
     // Make a POST request to the login endpoint with email and password
    const response = await axios.post(`${API_BASE_URL}/mobile/login`, { email, password });

     // If the response contains a token, store it in AsyncStorage
    if (response.data.token) {
      await AsyncStorage.setItem("jwtToken", response.data.token);
      console.log("Token stored in AsyncStorage:", response.data.token); 

      const decoded = jwtDecode(response.data.token); // decoded token
      console.log("Decoded Token:", decoded); 

      const userData = { email: decoded.sub };   // Prepare user data from the decoded token
      
      return userData; // Return the user data to be used in other parts of the app
    }
    return null; 
  } catch (error) {
    console.error("Login error:", error);
    throw error; // Throw the error to handle it in the AuthProvider
  }
};


// Function to handle user signup
const signup = async (username, password, phone, email, country, chatColor, profilePicture ) => {
  try {
     // Make a POST request to the signup endpoint with the user data
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

// Function to handle user account deletion
const deleteUserAccount = async (email) => {
  try {
      // Retrieve the stored JWT token from AsyncStorage for authentication
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
      console.error("No token found, cannot delete account");
      return { success: false, message: "No authentication token" };
    }
  // If no email is provided, return an error indicating missing user ID
    if (!email) {
      console.error("No user ID provided, cannot delete account");
      return { success: false, message: "Missing user ID" };
    }
    // Make a DELETE request to the delete user endpoint, passing the email and authorization token
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

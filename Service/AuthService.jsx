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
      const userData = { email: decoded.sub, u_id: decoded.uId || null };
      return userData; // Return user data instead of setting it here
    }
    return null; // Return null if no token is found
  } catch (error) {
    console.error("Login error:", error);
    throw error; // Throw the error to handle it in the AuthProvider
  }
};



const signup = async (username, password, phone, email, country, chatColor = "#000000", profilePicture = "pp-1.png") => {
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

export default {
  login,
  signup,
};

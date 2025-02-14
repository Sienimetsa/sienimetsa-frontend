import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { jwtDecode } from "jwt-decode";


const login = async (email, password, navigation) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mobile/login`, { email, password });
    console.log(response.data);

    if (response.data.token) {
      await AsyncStorage.setItem('jwtToken', response.data.token);
      console.log('Login successful, JWT Token:', response.data.token);

      // Decode token and set user
      const decoded = jwtDecode(response.data.token);
      console.log('Decoded JWT:', decoded);

      // Navigate to Main screen after successful login
      navigation.navigate('Main');  // Ensure you have access to the navigation prop

      return response.data.token;
    } else {
      console.error('Login failed');
      return null;
    }
  } catch (error) {
    console.error('Error during login:', error.message);
    if (error.response) {
      console.error('Response Error:', error.response);
    } else {
      console.error('Error Details:', error);
    }
    throw error;
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

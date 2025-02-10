import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../Config/Config'; 
const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mobile/login`, { email, password });
    console.log(response.data); // Log the full response

    if (response.data.token) {
      await AsyncStorage.setItem('jwtToken', response.data.token);
      console.log('Login successful, JWT Token:', response.data.token);
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


const signup = async (username, password, phone, email, country) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mobile/signup`, {
      username,
      password,
      phone,
      email,
      country,
    });

    // Check if the response is successful
    if (response.status === 201) { // 201 Created
      console.log('Signup successful');
      return true;
    } else {
      console.error('Signup failed');
      return false;
    }
  } catch (error) {
    console.error('Error during signup:', error);
    throw error; // Re-throw the error to handle it in the component
  }
};

export default {
  login,
  signup,
};
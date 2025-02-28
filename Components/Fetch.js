//FILE TO FETCH DATA FROM API

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "@env";

//FETCH MUSHROOMS DATA
export const fetchMushroomsData = async () => {
  try {
    const token = await AsyncStorage.getItem("jwtToken");

    if (!token) {
      console.error("No JWT token found.");
      return { error: "No JWT token found." };
    }

    const response = await axios.get(`${API_BASE_URL}/allmushrooms`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status !== 200) {
      throw new Error("Network response was not ok");
    }

    return response.data;
  } catch (error) {
    console.error(error);
    return { error };
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//FETCH CURRENT USER DATA
export const fetchCurrentUser = async (setUser) => {
  try {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
      console.error("No JWT token found.");
      return { error: "No JWT token found." };
    }

    const response = await axios.get(`${API_BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 200) {
      const userData = response.data;
      setUser(userData);
      return userData;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { error };
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// FETCH ALL USER DATA
export const fetchAllUsers = async () => {
  try {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
      console.error("No JWT token found.");
      return { error: "No JWT token found." };
    }
    const response = await axios.get(`${API_BASE_URL}/api/appusers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching app users:", error);
    return { error };
  }
};
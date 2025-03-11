//FILE TO FETCH DATA FROM API

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_ALLMUSHROOMS,API_PROFILE,API_APPUSERS,API_USERFINDINGS,API_DELETEFINDING } from "@env";
import { jwtDecode } from "jwt-decode";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//FETCH MUSHROOMS DATA
export const fetchMushroomsData = async () => {
  try {
    const token = await AsyncStorage.getItem("jwtToken");

    if (!token) {
      console.error("No JWT token found.");
      return { error: "No JWT token found." };
    }

    const response = await axios.get(`${API_ALLMUSHROOMS}`, {
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

    const response = await axios.get(`${API_PROFILE}`, {
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
    const response = await axios.get(`${API_APPUSERS}`, {
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//FETCH USER FINDINGS
export const fetchUserFindings = async () => {
  try {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
      console.error("No JWT token found.");
      return { error: "No JWT token found." };
    }

    const decodedToken = jwtDecode(token);
    const u_id = decodedToken.u_id;

    const response = await axios.get(`${API_USERFINDINGS}/${u_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching user findings:", error);
    return { error };
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//DELETE USER FINDING
export const deleteFinding = async (findingId) => {
  try {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
      console.error("No JWT token found.");
      return { error: "No JWT token found." };
    }

    const response = await axios.delete(`${API_DELETEFINDING}/${findingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (response.status === 204) {
      return { success: true };
    } else {
      return { error: "Failed to delete finding" };
    }
  } catch (error) {
    console.error("Error deleting finding:", error);
    return { error: error.message };
  }
};
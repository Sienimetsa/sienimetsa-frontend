import React, { useState, useEffect, useContext } from "react";
import { View, Text, TextInput, Button, Alert, Image, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "@env";
import profilePictureMap from "../Components/ProfilePictureMap.js";
import { AuthContext } from "../Service/AuthContext";

export default function SettingScreen({ navigation }) {
  const { user, setUser } = useContext(AuthContext);
  const [username, setUsername] = useState(user?.username || "");
  const [newPassword, setNewPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "pp1");
  const [chatColor, setChatColor] = useState(user?.chatColor || "#000000");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);

  // Fetch user data function
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
  
      if (!token) {
        console.error("No JWT token found.");
        navigation.navigate("Login");
        return;
      }
  
      const response = await axios.get(`${API_BASE_URL}/api/appusers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
    } catch (error) {
      console.error("Error fetching profile data:");
      if (error.response) {
        console.error("Response Error Status:", error.response.status);
        console.error("Response Error Data:", error.response.data);
      } else {
        console.error("Error Message:", error.message);
      }
    }
  };
  

  useEffect(() => {
    fetchUserData();
  }, []);

  // Update user profile
  const updateProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        return;
      }
  
      const payload = {
        username: username,
        password: newPassword,
        profilePicture: profilePicture,
        chatColor: chatColor,
      };
  
      const response = await axios.put(`${API_BASE_URL}/api/profile/update`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log(response.data);
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
    }
  };

  //TODO: To be changed later to pop-up window
  const changeProfilePicture = () => {
    const profilePictures = Object.keys(profilePictureMap);
    const randomPicture = profilePictures[Math.floor(Math.random() * profilePictures.length)];
    setProfilePicture(randomPicture);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      {/* Profile Picture */}
      <TouchableOpacity onPress={changeProfilePicture}>
        <Image source={profilePictureMap[profilePicture]} style={styles.profileImage} />
        <Text style={styles.changeText}>Change Profile Picture</Text>
      </TouchableOpacity>

      {/* Username Input */}
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={(text) => {
          setUsername(text);
        }}
        placeholder="Enter new username"
      />
      {!isUsernameAvailable && <Text style={styles.errorText}>Username is already taken</Text>}

      {/* Chat Color Input */}
      <Text style={styles.label}>Chat Color</Text>
      <TextInput
        style={styles.input}
        value={chatColor}
        onChangeText={setChatColor}
        placeholder="Enter chat color (e.g., #ff5733)"
      />

      {/* Password Input */}
      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Enter new password"
        secureTextEntry
      />

      {/* Save Button */}
      <Button title="Save Changes" onPress={updateProfile} color="#007BFF" />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
  },
  changeText: {
    textAlign: "center",
    color: "#007BFF",
    marginTop: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    backgroundColor: "#fff",
    marginTop: 5,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
  },
});


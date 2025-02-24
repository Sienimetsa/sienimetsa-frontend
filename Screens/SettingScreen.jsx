import React, { useState, useEffect, useContext } from "react";
import { 
  View, Text, TextInput, Button, Alert, Image, TouchableOpacity, 
  StyleSheet, Modal, FlatList 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "@env";
import profilePictureMap from "../Components/ProfilePictureMap.js";
import { AuthContext } from "../Service/AuthContext";


export default function SettingScreen({ navigation }) {
  const { user, setUser, logout, deleteAccount } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("pp1");
  const [chatColor, setChatColor] = useState("#000000");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  // Fetch user data when the settings screen loads
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) {
          navigation.navigate("Login"); // Redirect if no token
          return;
        }

        // Fetch user data from API
        const response = await axios.get(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const userData = response.data;
          setUser(userData); // Update AuthContext user
          setUsername(userData.username);
          setProfilePicture(userData.profilePicture);
          setChatColor(userData.chatColor);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Handle account deletion
  const handleDelete = async () => {
    const success = await deleteAccount();
    if (success) {
      await logout();  // Logout after deleting the user
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } else {
      Alert.alert("Failed to delete account.");
    }
  };

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

      if (response.status === 200) {
        Alert.alert("Profile updated successfully!");
        setUpdateMessage("Profile updated successfully!"); // Show message
        setTimeout(() => setUpdateMessage(""), 3000); // Clear after 3 sec
      }
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
    }
  };

  // Open profile picture selection modal
  const openProfilePictureModal = () => setModalVisible(true);

  // Select profile picture
  const selectProfilePicture = (pictureKey) => {
    setProfilePicture(pictureKey);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      {/* Profile Picture Selection */}
      <TouchableOpacity onPress={openProfilePictureModal}>
        <Image source={profilePictureMap[profilePicture]} style={styles.profileImage} />
        <Text style={styles.changeText}>Change Profile Picture</Text>
      </TouchableOpacity>

      {/* Modal for Selecting Profile Picture */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Profile Picture</Text>
            <FlatList
              data={Object.keys(profilePictureMap)}
              numColumns={3}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => selectProfilePicture(item)}>
                  <Image source={profilePictureMap[item]} style={styles.modalImage} />
                </TouchableOpacity>
              )}
            />
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>

      {/* Username Input */}
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
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
      <Button title="Delete Account" onPress={handleDelete} color="red" />
      {updateMessage ? <Text style={styles.successMessage}>{updateMessage}</Text> : null}

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
  successMessage: {
    color: "green",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dim background
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalImage: {
    width: 80,
    height: 80,
    margin: 10,
    borderRadius: 40,
  },
});

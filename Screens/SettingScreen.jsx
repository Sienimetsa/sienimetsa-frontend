import React, { useState, useEffect, useContext } from "react";
import {
  View, Text, TextInput, Button, Alert, Image, TouchableOpacity,
  StyleSheet, Modal, FlatList,TouchableWithoutFeedback,Keyboard
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_PROFILE_UPDATE } from "@env";
import profilePictureMap from "../Components/ProfilePictureMap.js";
import { AuthContext } from "../Service/AuthContext";
import { fetchCurrentUser,fetchAllUsers } from "../Components/Fetch.js";
import Toast from "react-native-toast-message";

export default function SettingScreen({ navigation }) {
  const { user, setUser, logout, deleteAccount } = useContext(AuthContext); // Retrieve user data and actions from AuthContext
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("pp1");
  const [chatColor, setChatColor] = useState("#000000");
  const [modalVisible, setModalVisible] = useState(false);


  // Fetch user data when the settings screen loads
  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchCurrentUser(setUser);
      if (!result.error) {
        setUsername(result.username);
        setProfilePicture(result.profilePicture);
        setChatColor(result.chatColor);
      } else {
        if (result.error === "No JWT token found.") {
          navigation.navigate("Login");
        }
      }
    };
  
    fetchData();
  }, []);

  // Show toast message for updating/deleting account and checking username
  const showToast = (type, message) => {
    Toast.show({
      type: type, // 'success' or 'error'
      text1: message,
      position: "bottom",
      visibilityTime: 3000,
      autoHide: true,
    });
  };

// Check username availability
 const checkUsernameAvailability = async () => {
  try {
    const usersData = await fetchAllUsers();
    if (!usersData || !usersData._embedded || !usersData._embedded.appusers) {
      console.error("Error: Unexpected response structure", usersData);
      showToast("error", "Error fetching users.");
      return false;
    }

    const otherUsers = usersData._embedded.appusers.filter(appUser => appUser.username !== user.username);
    const isUsernameTaken = otherUsers.some(appUser => appUser.username === username);

    if (isUsernameTaken) {
      showToast("error", "Username is already taken!");
      return false;
    } 
    return true;
  } catch (error) {
    console.error("Error checking username:", error);
    showToast("error", "Error checking username.");
    return false;
  }
};
  

  // Handle account deletion
  const handleDelete = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const success = await deleteAccount();
              if (success) {
                showToast("success", "Account deleted successfully!");
  
                // Navigate after a short delay to let the toast show
                setTimeout(async () => {
                  await logout();
                  navigation.reset({ index: 0, routes: [{ name: "Login" }] });
                }, 1000);
              } else {
                showToast("error", "Failed to delete account.");
              }
            } catch (error) {
              console.error("Error deleting account:", error);
              showToast("error", "An error occurred while deleting your account.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };
  
  
  
  // Update user profile
  const updateProfile = async () => {
    const isUsernameAvailable = await checkUsernameAvailability();
    if (!isUsernameAvailable) return;
  
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        showToast("error", "No token found. Please log in again.");
        return;
      }
  
      const payload = {
        username,
        password: newPassword,
        profilePicture,
        chatColor,
      };
  
      const response = await axios.put(`${API_PROFILE_UPDATE}`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
  
      if (response.status === 200) {
        setUser({ ...user, username, profilePicture, chatColor });
        showToast("success", "Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
      showToast("error", "Failed to update profile.");
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                <TouchableOpacity
                testID={`profile-picture-${item}`}
                 onPress={() => selectProfilePicture(item)}>
                  <Image source={profilePictureMap[item]} style={styles.modalImage} accessibilityRole="image" />
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
      <Button  testID="SaveChanges" title="Save Changes" onPress={updateProfile} color="#007BFF" />
      <Button  testID="DeleteAccount" title="Delete Account" onPress={handleDelete} color="red" />
      <Toast /> 

    </View>
    </TouchableWithoutFeedback>
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
  errorMessage: {
    color: "red",
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
    width: 60,
    height: 60,
    margin: 10,
    borderRadius: 40,
  },
});
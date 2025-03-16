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

export default function SettingScreen({ navigation }) {
  const { user, setUser, logout, deleteAccount } = useContext(AuthContext); // Retrieve user data and actions from AuthContext
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("pp1");
  const [chatColor, setChatColor] = useState("#000000");
  const [modalVisible, setModalVisible] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [usernameError, setUsernameError] = useState(""); 

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

// Check username availability
 const checkUsernameAvailability = async () => {
  try {
    const usersData = await fetchAllUsers(); // Fetch all users

    // Check if usersData and _embedded.appusers exist
    if (!usersData || !usersData._embedded || !usersData._embedded.appusers) {
      console.error("Error: Unexpected response structure", usersData);
      setUsernameError("Error fetching users.");
      return false;
    }

    // Filter out the current user's username
    const otherUsers = usersData._embedded.appusers.filter(appUser => appUser.username !== user.username);

    // Check if the username already exists in the filtered 'appusers' array
    const isUsernameTaken = otherUsers.some(appUser => appUser.username === username);

    if (isUsernameTaken) {
      setUsernameError("Username is already taken!");
    
      return false;
    } else {
      setUsernameError(""); // Clear error if username is available
      return true;
    }
  } catch (error) {
    console.error("Error checking username:", error);
    setUsernameError("Error checking username.");
    return false;
  }
};
  

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

    const isUsernameAvailable = await checkUsernameAvailability(); // Check username availability before proceeding

    if (!isUsernameAvailable) {
      return; // If the username is not available, stop the profile update
    }

    try {
      const token = await AsyncStorage.getItem("jwtToken"); // Retrieve token to authorize the update
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        return;
      }
      // Prepare the payload with updated profile data
      const payload = {
        username: username,
        password: newPassword,
        profilePicture: profilePicture,
        chatColor: chatColor,
      };
      // Make API request to update the user profile
      const response = await axios.put(`${API_PROFILE_UPDATE}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const { email } = user;
      if (response.status === 200) {
        setUser({
          email,
          username,
          profilePicture,
          chatColor,
        });
        setUpdateMessage("Profile updated successfully!"); // Show message
        setTimeout(() => setUpdateMessage(""), 3000);
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
      {updateMessage ? <Text style={styles.successMessage}>{updateMessage}</Text> : null}

     {/* Show Username Error Message */}
     {usernameError ? (<Text style={styles.errorMessage}>{usernameError}</Text>) : null}

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
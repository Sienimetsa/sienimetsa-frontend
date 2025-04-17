import React, { useState, useEffect, useContext } from "react";
import {
  View, Text, TextInput, Button, Alert, Image, TouchableOpacity,
  StyleSheet, Modal, FlatList, TouchableWithoutFeedback, Keyboard, ImageBackground
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_PROFILE_UPDATE } from "@env";
import profilePictureMap from "../Components/ProfilePictureMap.js";
import { AuthContext } from "../Service/AuthContext.js";
import { fetchCurrentUser, fetchAllUsers } from "../Service/Fetch.js";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import * as Progress from 'react-native-progress';
import { ScrollView } from 'react-native';




const COLORS = [
  { name: "Red", hex: "#CF4C3F" },
  { name: "Blue", hex: "#3E84C1" },
  { name: "Green", hex: "#93B819" },
  { name: "Yellow", hex: "#D8C00F" },
  { name: "Purple", hex: "#9B59B6" },
  { name: "Orange", hex: "#D47D48" },
  { name: "Pink", hex: "#E36893" },
  { name: "brown", hex: '#574E47' },
];
export default function ProfileScreen({ navigation }) {
  const { user, setUser, logout, deleteAccount } = useContext(AuthContext); // Retrieve user data and actions from AuthContext
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("pp1");
  const [chatColor, setChatColor] = useState("#000000");
  const [modalVisible, setModalVisible] = useState(false);
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0);
  const [uniqueMushrooms, setUniqueMushrooms] = useState(0);
  const [usernameModalVisible, setUsernameModalVisible] = useState(false);




  // Fetch user data when the settings screen loads
  useEffect(() => {
    const fetchData = async () => {
      // Fetch current user data
      const result = await fetchCurrentUser(setUser);

      if (!result.error) {
        setUsername(result.username);
        setProfilePicture(result.profilePicture);
        setChatColor(result.chatColor);
        setLevel(result.level || 1);
        setProgress(result.progress || 0);

        // Assuming result.uniqueMushrooms is an array of mushroom IDs
        if (result.uniqueMushrooms && Array.isArray(result.uniqueMushrooms)) {
          // Use a Set to get unique mushrooms from the array
          const uniqueMushroomsSet = new Set(result.uniqueMushrooms);
          setUniqueMushrooms(uniqueMushroomsSet.size);  // Set size gives the number of unique mushrooms
        } else {
          setUniqueMushrooms(0);  // If no mushrooms or error, set to 0
        }
      } else {
        if (result.error === "No JWT token found.") {
          navigation.navigate("Login");
        }
      }
    };

    fetchData();
  }, []);  // Empty dependency array to run on component mount


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
        // First update the context state with the new profile data
        setUser({
          ...user,
          username,
          profilePicture,
          chatColor,
        });

        // Optionally refetch the user data to ensure everything is in sync with the backend
        const updatedUser = await fetchCurrentUser(setUser); // This will fetch and update the user context
        if (updatedUser) {
          showToast("success", "Profile updated successfully!");
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
      showToast("error", "Failed to update profile.");
    }
  };

  const openColorModal = () => setColorModalVisible(true);

  const selectChatColor = (color) => {
    setChatColor(color);
    setColorModalVisible(false);
  };
  // Open profile picture selection modal
  const openProfilePictureModal = () => setModalVisible(true);

  // Select profile picture
  const selectProfilePicture = (pictureKey) => {
    setProfilePicture(pictureKey);
    setModalVisible(false);
  };


  return (
    <ImageBackground
      source={require('../assets/Backgrounds/sieni-bg.jpg')} // Adjust the path if needed
      style={styles.container}
      resizeMode="cover" // Optional: Adjust how the image scales
    >
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();  // Dismiss the keyboard
        }}
      >
 <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>

          <View style={styles.introContainerBox}>
            <View style={styles.introContainer}>
              {/* Profile Picture Selection */}
              <TouchableOpacity onPress={openProfilePictureModal} style={styles.profileContainer}>
                <Image source={profilePictureMap[profilePicture]} style={styles.profileImage} />
                <View style={styles.editIconCircle}>
                  <Ionicons name="brush" size={16} color="#574E47" />
                </View>
              </TouchableOpacity>

              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>

                  <Text onPress={() => setUsernameModalVisible(true)} style={styles.infoTextUsername} numberOfLines={1} adjustsFontSizeToFit >{username}</Text>
                  <TouchableOpacity onPress={() => setUsernameModalVisible(true)}>
                    <View style={styles.editIconCirclePenicil}>
                      <Ionicons name="pencil" size={13} color="white" />
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', gap: 2 }}>
                  <Text style={styles.infoTextLabel}>Level:</Text>
                  <Text style={styles.infoTextValue}>{level}</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 2 }}>
                  <Text style={styles.infoTextLabel}>Unique Mushrooms :</Text>
                  <Text style={styles.infoTextValue}>{uniqueMushrooms}/100</Text>
                </View>
              </View>


            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.progressText}>Level Progress</Text>
                <Progress.Bar
                  progress={progress / 100}  // Convert progress to a value between 0 and 1
                  width={150}
                  height={20}
                  borderRadius={5}
                  color="#574E47"
                  unfilledColor="#d3d3d3"
                />
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>
            </View>
            <View style={styles.hr} />


            {/* Modal for Selecting Profile Picture */}
            <Modal visible={modalVisible} animationType="fade" transparent={true}>
              <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                  <TouchableWithoutFeedback>
                    <View style={styles.modalContent}>
                      <TouchableOpacity style={styles.closeIcon} onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={24} color="#574E47" />
                      </TouchableOpacity>
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
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>



            {/* Modal for Editing Username */}
            <Modal visible={usernameModalVisible} animationType="fade" transparent={true}>
              <TouchableWithoutFeedback onPress={() => setUsernameModalVisible(false)}>
                <View style={styles.modalContainer}>
                  <TouchableWithoutFeedback>
                    <View style={styles.modalContent}>
                      <TouchableOpacity style={styles.closeIcon} onPress={() => setUsernameModalVisible(false)}>
                        <Ionicons name="close" size={24} color="#574E47" />
                      </TouchableOpacity>
                      <Text style={styles.modalTitle}>Change Username</Text>
                      <View style={{ flexDirection: 'row', gap: 15 }}>
                        <TextInput
                          style={styles.input}
                          value={username}
                          onChangeText={setUsername}
                          placeholder="Enter new username"
                        />

                        <TouchableOpacity style={styles.buttonSaveUsername} onPress={() => setUsernameModalVisible(false)}>
                          <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>

                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>


            {/* Chat Color Selection */}
            <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
              <Text style={styles.label}>Chat Color</Text>
              <TouchableOpacity onPress={openColorModal} style={[styles.colorPreview, { backgroundColor: chatColor }]}>
                <Text style={styles.colorText}>Select Chat Color</Text>
              </TouchableOpacity>
            </View>
            {/* Chat Color Modal */}
            <Modal visible={colorModalVisible} animationType="fade" transparent={true}>
              <TouchableWithoutFeedback onPress={() => setColorModalVisible(false)}>
                <View style={styles.modalContainer}>
                  <TouchableWithoutFeedback>
                    <View style={styles.modalContent}>
                      <TouchableOpacity style={styles.closeIcon} onPress={() => setColorModalVisible(false)}>
                        <Ionicons name="close" size={24} color="#574E47" />
                      </TouchableOpacity>
                      <Text style={styles.modalTitle}>Choose Chat Color </Text>

                      <FlatList
                        data={COLORS}
                        numColumns={4}
                        keyExtractor={(item) => item.hex}
                        renderItem={({ item }) => (
                          <TouchableOpacity onPress={() => selectChatColor(item.hex)} style={[styles.colorCircle, { backgroundColor: item.hex }]}>
                            {chatColor === item.hex && <Text style={styles.selectedColor}>✔</Text>}
                          </TouchableOpacity>
                        )}
                      />

                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>



            {/* Password Input */}
            <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                secureTextEntry
              />
            </View>

            {/* Save Button with Icon */}
            <TouchableOpacity
              testID="SaveChanges"
              onPress={updateProfile}
              style={styles.buttonSave}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Save Changes</Text>
                <Ionicons name="save" size={20} color="white" />
              </View>
            </TouchableOpacity>

          </View>



          {/* Delete Button with Icon */}
          <TouchableOpacity
            testID="DeleteAccount"
            onPress={handleDelete}
            style={[styles.buttonDelete]}
          >
            <View style={{ flexDirection: 'row', gap: 5 }}>
              <Text style={styles.buttonTextDelete}>Delete Account</Text>
              <Ionicons name="trash" size={20} color="black" />
            </View>
          </TouchableOpacity>
          <Toast />

        </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    borderRadius: 30,
  
    justifyContent: "center",
    alignItems: "center",
    justifyContent: "flex-start",
    
  },
  introContainerBox: {
    marginTop: 30,
    backgroundColor: "rgba(255, 255, 255, 0.93)",
    borderRadius: 20,
    paddingHorizontal: 20, 
    paddingVertical: 20,
    shadowColor: "rgb(156, 131, 102)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, 
    maxWidth: 500,          
    alignSelf: 'center',
  },
  
  introContainer: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 30,
    width: '90%',   
  },
  infoTextLabel: {
    fontFamily: 'Nunito-ExtraBold',
    fontWeight: "bold",
    color: '#574E47',
    fontSize: 14,
    
  },
  infoTextValue: {
    fontFamily: 'Nunito-Medium',
    fontSize: 14,
    color: '#574E47',
  },
  infoTextUsername: {
    fontFamily: 'Nunito-Bold',
    fontWeight: "bold",
    color: "#574E47",
    maxWidth: 180,
    fontSize: 23,
    marginRight: 7,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 50,
    alignSelf: "center",
  },
  profileContainer: {
    alignSelf: "center",
    position: "relative",
  },
  editIconCircle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    backgroundColor: "white",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgb(176, 167, 156)",

  },
  editIconCirclePenicil: {
    position: "absolute",
    bottom: -10,
    right: -30,
    width: 23,
    height: 23,
    backgroundColor: "rgb(76, 70, 63)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,

  },
  progressText: {
    fontFamily: 'Nunito-medium',
    color: '#574E47',

  },
  changeText: {
    textAlign: "center",
    color: "#007BFF",
    marginTop: 5,
  },
  label: {
    fontFamily: 'Nunito-bold',
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    color: "rgb(72, 56, 38)",
  },
  input: {
    fontFamily: 'Nunito-medium',
    height: 40,
    borderColor: "rgba(72, 56, 38, 0.57)",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "rgb(244, 242, 241)",
    marginTop: 5,
    width: 160,
    paddingHorizontal: 10,
  },
  colorPreview: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
    width: 160,
  },
  colorText: {
    fontFamily: 'Nunito-SemiBold',
    color: "#fff",

  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 36,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-extraBold',
    color: '#574E47',
    marginBottom: 15,
    textAlign: "center",
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedColor: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalImage: {
    width: 60,
    height: 60,
    margin: 10,
    borderRadius: 40,
  },
  buttonSave: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 45,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    backgroundColor: "#574E47",
    width: 200,
    alignSelf: "center",
  },
  buttonSaveUsername: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#574E47",
    maxWidth: 120,
    alignSelf: "center",
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  buttonDelete: {
    marginTop: 40,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Nunito-bold',
  },
  buttonTextDelete: {
    color: 'black',
    fontSize: 14,
    fontFamily: 'Nunito-bold',
    textShadowColor: "rgb(241, 232, 218)",  
    textShadowOffset: { width: 3, height: 0 },  
    textShadowRadius: 5,  
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "rgb(117, 102, 82)",
    marginVertical: 10,
    padding: 10,
    marginTop: 23,
    marginBottom: 36
  },
  closeIcon: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
  },
});

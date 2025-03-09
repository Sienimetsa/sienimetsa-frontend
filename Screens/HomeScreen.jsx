import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, TouchableOpacity, Modal, Image, Alert } from "react-native";
import { AuthContext } from "../Service/AuthContext";
import { useNavigation } from '@react-navigation/native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { API_BUCKET_UPLOAD } from "@env";
import axios from "axios"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {

  const { user, loading } = useContext(AuthContext);
  const navigation = useNavigation();
  const [facing, setFacing] = useState('back'); // camera facing
  const [permission, requestPermission] = useCameraPermissions(); // camera permission
  const cameraRef = React.useRef(null); // camera reference
  const [photoModalVisible, setPhotoModalVisible] = useState(false); // photo modal visibility
  const [photoUri, setPhotoUri] = useState(null); // state to store the photo uri
  const [image, setImage] = useState(null); // state to store image for upload
  const [errorMessage, setErrorMessage] = useState(""); // upload error message
  const [successMessage, setSuccessMessage] = useState(""); //  upload success message

  // ask for camera permission on page load
  useEffect(() => {
    const requestCameraPermission = () => {
      if (!permission) {
        requestPermission();
      }
    };
    requestCameraPermission();
  }, [permission]);

  // display "Loading..." while user is being fetched
  if (loading) {
    return <Text>Loading...</Text>;
  }

  // return an empty view if the permission status is not yet determined
  if (!permission) {
    return <View />;
  }

  // if user does not grant permission to use camera display a message and a button to request permission
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
        {/* SETTINGS BUTTON BLOCK */}
        <Button
          title="Go to Settings"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
    );
  }

  // function to toggle camera back and front camera
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // function to take a photo and display it in a modal
  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri); // Store the photo URI
      setImage(photo); // Store the photo for upload
      setPhotoModalVisible(true);
      console.debug(photo)
    }
  };

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // function to upload the image to backend
  const uploadToBackend = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        navigation.navigate("Login");
        return;
      }
  
      if (!image) {
        setErrorMessage("Please take a photo to upload.");
        return;
      }
  
      // Extract the base64 string from the URI
      const base64Image = image.base64;
  
      if (!base64Image) {
        setErrorMessage("No base64 image data found.");
        return;
      }
  
      // Convert base64 to a Blob
      const byteCharacters = atob(base64Image.split(',')[1]);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset++) {
        byteArrays.push(byteCharacters.charCodeAt(offset));
      }
      const byteArray = new Uint8Array(byteArrays);
      
      const blob = new Blob([byteArray], { type: "image/jpg" });
  
      // Create a file-like object
      const file = new File([blob], "image.jpg", { type: "image/jpg" });
  
      // Log the file to ensure it's correctly formatted
      console.log("File object to be uploaded:", file);
  
      // Prepare the FormData with the file
      const formData = new FormData();
      formData.append("file", file);
  
  
      // Send the request to the backend
      const response = await axios.post(API_BUCKET_UPLOAD, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.status === 200) {
        setSuccessMessage("Image uploaded successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage("Failed to upload image.");
      }
    } catch (error) {
      console.error("Error uploading image:", error.response?.data || error.message);
      setErrorMessage("An error occurred while uploading the image.");
    }
  };
  
  
  return (
    <View style={styles.container}>

      {/* WELCOME MESSAGE BLOCK */}
      <Text style={styles.welcomeText}>Welcome, {user ? user.email : "Loading"}!</Text>

      {/* SETTINGS BUTTON BLOCK */}
      <Button
        title="Go to Settings"
        onPress={() => navigation.navigate('Settings')}
      />

      {/* CAMERA VIEW BLOCK */}
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.text}>Snap Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* PHOTO MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={photoModalVisible}
        onRequestClose={() => setPhotoModalVisible(false)}>
        <View style={styles.modalContainer}>

        <Text style={styles.uploadText}>Do you want to upload this photo?</Text>
          <Image source={{ uri: photoUri }} style={styles.photo} />
          <View style={styles.buttonRow}>
            <Button title="Yes, Upload" onPress={uploadToBackend} />
            <Button title="Close" onPress={() => setPhotoModalVisible(false)} />
          </View>
        {/* SUCCESS & ERROR MESSAGES */}
       {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
       {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
        </View>
      </Modal>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  photo: {
    width: 300,
    height: 400,
    marginBottom: 20,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  successText:{
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgb(60, 212, 10)',
  },
  errorText:{
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
  },
});

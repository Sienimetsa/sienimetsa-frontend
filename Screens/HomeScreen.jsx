import React, { useContext, useEffect } from "react";
import { View, Text, StyleSheet, Button, TouchableOpacity, Modal, Image } from "react-native";
import { AuthContext } from "../Service/AuthContext";
import { useNavigation } from '@react-navigation/native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';

export default function HomeScreen() {

  const { user, loading } = useContext(AuthContext);
  const navigation = useNavigation();
  const [facing, setFacing] = useState('back'); // camera facing
  const [permission, requestPermission] = useCameraPermissions(); // camera permission
  const cameraRef = React.useRef(null); // camera reference
  const [photoModalVisible, setPhotoModalVisible] = useState(false); // photo modal visibility
  const [photoUri, setPhotoUri] = useState(null); // state to store the photo uri


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
      setPhotoUri(photo.uri);
      setPhotoModalVisible(true);
      console.debug(photo)
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
          <Image source={{ uri: photoUri }} style={styles.photo} />
          <Button title="Close" onPress={() => setPhotoModalVisible(false)} />
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
});

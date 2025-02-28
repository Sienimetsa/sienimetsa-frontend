import React, { useContext, useEffect } from "react";
import { View, Text, StyleSheet, Button, TouchableOpacity } from "react-native";
import { AuthContext } from "../Service/AuthContext";
import { useNavigation } from '@react-navigation/native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';

export default function HomeScreen() {

  const { user, loading } = useContext(AuthContext);
  const navigation = useNavigation();
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();


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
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

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
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

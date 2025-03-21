import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, TouchableOpacity, Modal, Image, TextInput, FlatList } from "react-native";
import { AuthContext } from "../Service/AuthContext";
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from "expo-image-manipulator";
import { fetchMushroomsData } from "../Components/Fetch";

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
  const [mushroomId, setMushroomId] = useState(""); // mushroom
  const [AImushroomresult, setAImushroomresult] = useState("*AI result*"); // AI mushroom result
  const [mushroomList, setMushroomList] = useState([]);
  const [searchText, setSearchText] = useState("");

  // fetch all mushrooms
  useEffect(() => {
    const fetchMushrooms = async () => {
      const result = await fetchMushroomsData();
      if (!result.error) {
        setMushroomList(result);
      } else {
        if (result.error === "No JWT token found.") {
          navigation.navigate("Login");
        }
      }
    };

    fetchMushrooms();
  }, []);

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
      const photo = await cameraRef.current.takePictureAsync({ base64: true }); // Request base64
      // Resize image to reduce file size
      const resizedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 800 } }], // Reduce width to 800px (adjust as needed)
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Reduce quality to 70%
      );

      setPhotoUri(resizedImage.uri);
      setImage(resizedImage);  // Use resized image for upload
      setPhotoModalVisible(true);
      // console.debug(photo); // print photo URI to console
    }
  };

  // filter mushroom list based on search text
  const filteredMushroomList = mushroomList.filter(item =>
    item.mname.toLowerCase().includes(searchText.toLowerCase())
  );


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

          {/* AI RESULT BLOCK */}
          <View>
            <Text style={styles.uploadText}>AI Mushroom Detection</Text>
            <View style={styles.AIGridContainer}>
              <View style={styles.AIGridObject}>
                <Text style={styles.AIGridText}>{AImushroomresult}</Text>
              </View>
              <View style={styles.AIGridObject}>
                <Text style={styles.AIGridText}>{AImushroomresult}</Text>
              </View>
              <View style={styles.AIGridObject}>
                <Text style={styles.AIGridText}>{AImushroomresult}</Text>
              </View>
            </View>
          </View>

          {/* SEARCH BAR BLOCK */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchBar}
              placeholder="Search mushrooms..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* MUSHROOMLIST BLOCK */}
          <FlatList
            data={filteredMushroomList}
            keyExtractor={(item) => item.m_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={
                  mushroomId === item.m_id.toString()
                    ? styles.selectedListButton
                    : styles.ListButton
                }
                onPress={() => {
                  // if clicked mushroom is already selected, deselect it
                  if (mushroomId === item.m_id.toString()) {
                    setMushroomId("");
                  } else {
                    setMushroomId(item.m_id.toString());
                  }
                }}
              >
                <Text style={styles.ListText}>{item.mname}</Text>
              </TouchableOpacity>
            )}
            style={{ maxHeight: 150, width: '80%' }}
          />

          <View style={styles.buttonRow}>
            <Button title="Save" onPress={() => {

              // Check if mushroom is selected
              if (!mushroomId) {
                setErrorMessage("Please select a mushroom first");
                return;
              }

              const selectedMushroom = mushroomList.find(m => m.m_id.toString() === mushroomId);

              // navigate to CreateFinding screen and pass the photoUri, mushroomId, image and mushroomName
              navigation.navigate('CreateFinding', {
                photoUri,
                mushroomId,
                image,
                mushroomName: selectedMushroom ? selectedMushroom.mname : null
              });

              setPhotoModalVisible(false);
            }} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  photo: {
    width: 150,
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  buttonRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgb(60, 212, 10)',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
  },
  formContainer: {
    width: '80%',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 10,
  },
  AIGridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '90%',
  },
  AIGridObject: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    margin: 5,
    minHeight: 80,
    borderRadius: 8,
    justifyContent: 'center',
  },
  AIGridText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flexShrink: 1,
  },
  AIGridLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  ListText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  searchContainer: {
    width: '80%',
    marginBottom: 10,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  ListButton: {
    padding: 10,
    margin: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedListButton: {
    padding: 10,
    margin: 5,
    backgroundColor: '#b3dbbf',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
});

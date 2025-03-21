import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Button, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { createNewFinding } from '../Components/Fetch';

export default function CreateFindingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { photoUri, mushroomId, image, mushroomName } = route.params || {};
  const [findingNotes, setFindingNotes] = useState('');
  const [findingCity, setFindingCity] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to upload the image to backend
  const saveFinding = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        navigation.navigate("Login");
        return;
      }

      const decodedToken = jwtDecode(token);
      const user_id = decodedToken.u_id;

      const mushroomIdNum = parseInt(mushroomId, 10);
      if (isNaN(mushroomIdNum)) {
        setErrorMessage("Invalid mushroom selection.");
        setIsLoading(false);
        return;
      }

      const now = new Date().toISOString().split('.')[0]; // "yyyy-mm-ddTh:min:sec"

      // Create finding object
      const finding = {
        notes: findingNotes || "",
        city: findingCity || "Unknown",
        f_time: now,
        imageURL: "", // Will be set by backend
        appuser: { u_id: user_id },
        mushroom: { m_id: mushroomIdNum }
      };

      const result = await createNewFinding(image, finding);

      if (result.success) {
        setSuccessMessage("Finding saved successfully!");
        setTimeout(() => {
            navigation.navigate('Main', { screen: 'Home' });
        }, 1500);
      } else {
        setErrorMessage(result.error || "Failed to save finding.");
      }
    } catch (error) {
      console.error("Error saving finding:", error);
      setErrorMessage(`Save failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Create New Finding</Text>
        
        {photoUri && (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        )}
        
        <View style={styles.infoContainer}>
          <Text style={styles.mushroomName}>
            Selected mushroom: {mushroomName || "None selected"}
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.input}
            placeholder="Add notes about your finding..."
            multiline={true}
            numberOfLines={4}
            value={findingNotes}
            onChangeText={setFindingNotes}
          />
          
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="City or location name"
            value={findingCity}
            onChangeText={setFindingCity}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Cancel" 
            onPress={() => navigation.goBack()} 
            color="#888"
          />
          <Button 
            title={isLoading ? "Saving..." : "Save Finding"} 
            onPress={saveFinding}
            disabled={isLoading}
            color="#4CAF50"
          />
        </View>
        
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  photo: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    alignSelf: 'center',
  },
  infoContainer: {
    backgroundColor: '#e6f7ed',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#b3dbbf',
  },
  mushroomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  formContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#444',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: 10,
  },
});
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Button, Alert, ScrollView, Switch } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { createNewFinding } from '../Components/Fetch';
import * as Location from 'expo-location';
import Toast from "react-native-toast-message";

export default function CreateFindingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { photoUri, mushroomId, image, mushroomName } = route.params || {};
  const [findingNotes, setFindingNotes] = useState('');
  const [findingCity, setFindingCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);

  // Show toast message function
  const showToast = (type, message) => {
    Toast.show({
      type: type, // 'success' or 'error'
      text1: message,
      position: "bottom",
      visibilityTime: 3000,
      autoHide: true,
    });
  };

  // Get current location when component mounts
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationErrorMsg('Permission to access location was denied');
        setUseCurrentLocation(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        // Try to get city name from coordinates
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });

        if (reverseGeocode && reverseGeocode.length > 0) {
          const address = reverseGeocode[0];
          setFindingCity(address.city || address.region || "Unknown location");
        }
      } catch (error) {
        console.error("Error getting location:", error);
        setLocationErrorMsg('Failed to get current location');
        setUseCurrentLocation(false);
      }
    })();
  }, []);

  // Function to upload the image to backend
  const saveFinding = async () => {
    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        showToast("error", "No token found. Please log in again.");
        navigation.navigate("Login");
        return;
      }

      const decodedToken = jwtDecode(token);
      const user_id = decodedToken.u_id;

      const mushroomIdNum = parseInt(mushroomId, 10);
      if (isNaN(mushroomIdNum)) {
        showToast("error", "Invalid mushroom selection.");
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

      // Add coordinates if available
      if (useCurrentLocation && location) {
        const lat = location.coords.latitude;
        const lng = location.coords.longitude;
        finding.city = `${lat}, ${lng}`;
      }

      console.log("Sending finding:", JSON.stringify(finding));
      const result = await createNewFinding(image, finding);

      if (result.success) {
        showToast("success", "Finding saved successfully!");
        setTimeout(() => {
          navigation.navigate('Main', { screen: 'Home' });
        }, 1500);
      } else {
        showToast("error", result.error || "Failed to save finding.");
      }
    } catch (error) {
      console.error("Error saving finding:", error);
      showToast("error", `Save failed: ${error.message}`);
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
          {locationErrorMsg ? (
            <Text style={styles.errorText}>{locationErrorMsg}</Text>
          ) : null}

          <View style={styles.locationContainer}>
            <View style={styles.switchContainer}>
              <Text>Use current coordinates?</Text>
              <Switch
                value={useCurrentLocation}
                onValueChange={setUseCurrentLocation}
              />
            </View>

            {useCurrentLocation && location ? (
              <View style={styles.locationInfo}>
                <Text>{location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}</Text>
              </View>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="City or location name"
                value={findingCity}
                onChangeText={setFindingCity}
                editable={!useCurrentLocation}
              />
            )}
          </View>
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
        <Toast />
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
  locationContainer: {
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationInfo: {
    backgroundColor: '#e6f7ed',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b3dbbf',
  },
});
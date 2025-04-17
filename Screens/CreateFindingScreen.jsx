import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, Switch, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { createNewFinding } from '../Service/Fetch';
import * as Location from 'expo-location';
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

export default function CreateFindingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { photoUri, mushroomId, image, mushroomCommonName, mushroomLatinName } = route.params || {};
  const [findingNotes, setFindingNotes] = useState('');
  const MAX_NOTES_LENGTH = 250;
  const [findingCity, setFindingCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);

  const scrollViewRef = useRef(null);
  const notesInputRef = useRef(null);

  const showToast = (type, message) => {
    Toast.show({
      type: type,
      text1: message,
      position: "bottom",
      visibilityTime: 3000,
      autoHide: true,
    });
  };

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

  const handleNotesFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleNotesChange = (text) => {
    setFindingNotes(text);
  };

  const saveFinding = async () => {
    setIsLoading(true);

    try {
      if (findingNotes && findingNotes.length > MAX_NOTES_LENGTH) {
        showToast("error", `Notes are too long. Please limit to ${MAX_NOTES_LENGTH} characters.`);
        setIsLoading(false);
        return;
      }

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

      const now = new Date().toISOString().split('.')[0];

      const finding = {
        notes: findingNotes || "",
        city: findingCity || "Unknown",
        f_time: now,
        imageURL: "",
        appuser: { u_id: user_id },
        mushroom: { m_id: mushroomIdNum }
      };

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
    <ImageBackground
      source={require('../assets/Backgrounds/sieni-bg.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create New Finding</Text>
          </View>

          <View style={styles.contentContainer}>
            {photoUri && (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photoUri }} style={styles.photo} />
              </View>
            )}

            <View style={styles.infoContainer}>
              <Text style={styles.mushroomCommonName}>
                {mushroomCommonName || "None selected"}
              </Text>
              <Text style={styles.mushroomLatinName}>
                {mushroomLatinName || "None selected"}
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.notesRow}>
                <Text style={styles.label}>Notes</Text>
                <Text style={[
                  styles.charCounter,
                  findingNotes.length > MAX_NOTES_LENGTH ? styles.charCounterExceeded : null
                ]}>
                  {findingNotes.length}/{MAX_NOTES_LENGTH}
                </Text>
              </View>
              <TextInput
                ref={notesInputRef}
                style={[
                  styles.input,
                  styles.notesInput,
                  findingNotes.trim() === '' && { height: 100 },
                  findingNotes.length > MAX_NOTES_LENGTH && styles.inputError
                ]}
                placeholder="Add notes about your finding..."
                multiline={true}
                numberOfLines={findingNotes.trim() ? 4 : 0}
                value={findingNotes}
                onChangeText={handleNotesChange}
                onFocus={handleNotesFocus}
                scrollEnabled={findingNotes.trim() !== ''}
                maxLength={MAX_NOTES_LENGTH + 50}
                autoFocus={false}
              />

              <Text style={styles.label}>Location</Text>
              {locationErrorMsg ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={24} color="#ff5762" />
                  <Text style={styles.errorText}>{locationErrorMsg}</Text>
                </View>
              ) : null}

              <View style={styles.locationContainer}>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Use current coordinates</Text>
                  <Switch
                    value={useCurrentLocation}
                    onValueChange={setUseCurrentLocation}
                    trackColor={{ false: "#D7C5B780", true: "#574E4780" }}
                    thumbColor={useCurrentLocation ? "#574E47" : "#f4f3f4"}
                  />
                </View>

                {useCurrentLocation && location ? (
                  <View style={styles.locationInfo}>
                    <Ionicons name="location" size={18} color="#574E47" />
                    <Text style={styles.locationText}>
                      {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                    </Text>
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
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, isLoading && styles.disabledButton]}
                onPress={saveFinding}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>{isLoading ? "Saving..." : "Save Finding"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Toast />
        </ScrollView>
      </KeyboardAvoidingView >
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  charCounter: {
    fontSize: 14,
    color: '#574E47',
    textAlign: 'right',
    marginBottom: 5,
    fontFamily: 'Nunito-Medium',
  },
  charCounterExceeded: {
    color: '#ff5762',
  },
  inputError: {
    borderColor: '#ff5762',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  titleContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.93)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 15,
    paddingBottom: 5,
    paddingHorizontal: 25,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    width: '70%',
  },
  contentContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.93)",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#574E47',
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
  },
  photoContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#D7C5B7',
  },
  photo: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  infoContainer: {
    backgroundColor: '#EBE2D9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#D7C5B7',
  },
  mushroomCommonName: {
    textAlign: 'center',
    fontSize: 22,
    color: '#574E47',
    fontFamily: 'Nunito-Bold',
    paddingBottom: 5,
  },
  mushroomLatinName: {
    textAlign: 'center',
    fontSize: 15,
    color: '#574E47',
    fontFamily: 'Nunito-Italic',
  },
  formContainer: {
    marginBottom: 20,
  },
  notesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    marginBottom: 8,
    color: '#574E47',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#D7C5B7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    textAlignVertical: 'top',
    fontFamily: 'Nunito-Medium',
  },
  notesInput: {
    minHeight: 100,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 87, 98, 0.1)',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#ff5762',
    marginLeft: 8,
  },
  locationContainer: {
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    fontFamily: 'Nunito-Medium',
    fontSize: 16,
    color: '#574E47',
  },
  locationInfo: {
    backgroundColor: '#D7C5B780',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D7C5B7',
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontFamily: 'Nunito-Medium',
    fontSize: 16,
    marginLeft: 10,
    color: '#574E47',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D7C5B7",
    width: 120,
  },
  cancelButtonText: {
    color: '#574E47',
    fontFamily: 'Nunito-Bold',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#574E47",
    width: 160,
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Alert, Linking, StyleSheet,Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_GDPR_PDF } from "@env";
import MushroomIcon from "../assets/chaticons/mushroomIcon.png"
const OpenPdfButton = ({ userId }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    try {
      setIsLoading(true);

      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        Alert.alert('Error', 'No token found. Please log in.');
        return;
      }
      // URL with token as a query parameter
      const url = `${API_GDPR_PDF}/${userId}?token=${token}`;

      // Check if the URL can be opened
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url); // Opens in the browser
      } else {
        Alert.alert('Error', 'Unable to open the PDF URL');
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      Alert.alert('Error', 'An error occurred while trying to open the PDF');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View style={styles.container}>

      <TouchableOpacity 
        style={styles.touchableButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.buttonText}>GDPR Policy</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
          <View style={{flexDirection: "column", alignItems: 'center'}}>
          <Image source={MushroomIcon} style={{ width: 35, height: 35 }} />
            <Text style={styles.modalTitle}>GDPR Policy</Text>
            </View>
            <Text style={styles.modalText}>
              Your data privacy is important to us. By accessing this report, you can view
              the information we hold about you in accordance with GDPR regulations.
            </Text>
            <View style={{flexDirection: "column", alignItems: 'center'}}>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={handlePress}
                disabled={isLoading}
              >
                <Text style={styles.viewButtonText}>{isLoading ? "Loading..." : "Open My GDPR Report"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.touchableButton, styles.closeButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchableButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#D7C5B7",
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.93)",
  },
  buttonText: {
    color: '#574E47',
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: '80%',
    borderRadius: 10,
    alignItems: 'center',
    paddingTop: 40,
  },
  modalTitle: {
    fontSize: 24,
    color: '#574E47',
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  viewButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    backgroundColor: "#574E47",
    width: 200,
    alignSelf: "center",
  },
  viewButtonText: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D7C5B7",
    width: 200,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.93)",
  },
  closeButtonText: {
    color: '#574E47',
    fontFamily: 'Nunito-Bold',
  },
});

export default OpenPdfButton;
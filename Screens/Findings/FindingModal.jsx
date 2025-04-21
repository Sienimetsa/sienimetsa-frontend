import React, { memo, useState } from 'react';
import { View, Text, Image, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { API_BASE_URL } from '@env';
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import Toast from "react-native-toast-message";


const FindingModal = memo(({ finding, onClose, onDelete }) => {
  const [imageLoading, setImageLoading] = useState(true);

  const copyLocationToClipboard = async () => {
    try {
      const textToCopy = finding.city || 'Unknown';
      console.log('Attempting to copy:', textToCopy);

      // Use the correct API method based on what's available
      if (Clipboard.setStringAsync) {
        await Clipboard.setStringAsync(textToCopy);
      } else if (Clipboard.setString) {
        await Clipboard.setString(textToCopy);
      } else {
        throw new Error('Clipboard API not available');
      }

      showToast('success', 'Location copied to clipboard');
    } catch (error) {
      console.error('Clipboard error:', error);
      showToast('error', 'Failed to copy location');
    }
  };

  // Helper function to show toast messages
  const showToast = (type, message) => {
    Toast.show({
      type: type,
      text1: message,
      position: "bottom",
      visibilityTime: 3000,
      autoHide: true,
    });
  };

  if (!finding) return null;

  const formatTime = (time) => {
    if (!time) return 'N/A';

    const date = new Date(time);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    const dateString = date.toLocaleDateString('fi-FI', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
      <View>
        <Text style={styles.timeText}>{timeString}</Text>
        <Text style={styles.dateText}>{dateString}</Text>
      </View>
    );
  }

  return (
    <View style={styles.modalContent}>
      <View style={styles.imageContainer}>
        {finding.imageURL ? (
          <>
            <Image
              source={{
                uri: `${API_BASE_URL}/images/${finding.imageURL}`
              }}
              style={styles.modalImage}
              resizeMode="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                console.error("Image loading error:", e.nativeEvent.error);
                setImageLoading(false);
              }}
            />
            {imageLoading && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#574E47" />
                <Text style={styles.loadingText}>Loading image...</Text>
              </View>
            )}
          </>
        ) : (
          <Image
            source={require("../../assets/mushroom-photos/mushroom_null.png")}
            style={styles.modalImage}
            resizeMode="cover"
          />
        )}
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.modalTitle}>{finding.mushroomCommonName || 'unknown'}</Text>
        <Text style={styles.modalSubTitle}>{finding.mushroomName || 'unknown'}</Text>
      </View>

      <View style={styles.modalRowContainer}>
        <Text style={styles.modalSubHeader}>Found on: </Text>
        {formatTime(finding.f_time)}
      </View>

      <View style={styles.modalRowContainer}>
        <Text style={styles.modalSubHeader}>Location: </Text>
        <View style={styles.locationTextContainer}>
          <Text style={styles.modalText} numberOfLines={2} ellipsizeMode="tail">
            {finding.city || 'Unknown'}
          </Text>
          <TouchableOpacity onPress={copyLocationToClipboard} style={styles.copyButton}>
            <Ionicons name="copy-outline" size={18} color="#574E47" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.notesContainer}>
        <View style={styles.notesTitleContainer}>
          <Text style={styles.notesHeader}>Notes: </Text>
        </View>
        <ScrollView style={styles.notesScrollContainer} contentContainerStyle={styles.notesContentContainer}>
          <Text style={styles.notesText}>{finding.notes || 'No notes available'}</Text>
        </ScrollView>
      </View>

      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <View style={styles.buttonContent}>
          <Text style={styles.deleteButtonText}>Delete Finding</Text>
          <Ionicons name="trash" size={20} color="white" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 30,
    width: "85%",
    alignItems: "center",
    borderWidth: 5,
    borderColor: '#D7C5B7',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  copyButton: {
    padding: 5,
    marginLeft: 8,
    alignSelf: 'center',
  },
  imageContainer: {
    width: '90%',
    height: 200,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D7C5B7',
    overflow: 'hidden',
    marginBottom: 15,
    position: 'relative',
    backgroundColor: '#f8f8f8',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 248, 248, 0.7)',
    zIndex: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#574E47',
    fontFamily: 'Nunito-Medium',
  },
  modalRowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '90%',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D7C5B780',
    paddingVertical: 2,
    borderRadius: 8,
  },
  locationTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  notesContainer: {
    width: '90%',
    marginTop: 30,
    position: 'relative',
  },
  notesTitleContainer: {
    position: 'absolute',
    top: -19,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    zIndex: 1,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#D7C5B780',
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
  },
  modalSubHeader: {
    fontSize: 16,
    color: '#574E47',
    fontFamily: 'Nunito-Bold',
    minWidth: 70,
    marginRight: 30,
    alignSelf: 'center'
  },
  notesHeader: {
    fontSize: 16,
    color: '#574E47',
    fontFamily: 'Nunito-Bold',
  },
  modalText: {
    fontFamily: 'Nunito-Medium',
    flexShrink: 1,
    textAlign: 'right',
    color: '#574E47',
    maxWidth: '85%',
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
  },
  closeButtonText: {
    color: '#574E47',
    fontFamily: 'Nunito-Bold',
  },
  deleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 45,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    backgroundColor: "#FF6B6B",
    width: 200,
    alignSelf: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontFamily: 'Nunito-Bold',
  },
  dateText: {
    fontFamily: 'Nunito-Medium',
    color: '#574E47',
    flexShrink: 1,
    textAlign: 'right',
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Nunito-Italic',
    color: '#574E47',
    flexShrink: 1,
    textAlign: 'right',
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  titleContainer: {
    backgroundColor: '#EBE2D9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#D7C5B7',
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#574E47',
    textAlign: 'center',
  },
  modalSubTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Italic',
    color: '#574E47',
    textAlign: 'center',
  },
  notesScrollContainer: {
    maxHeight: 80,
    width: '100%',
    borderWidth: 1,
    borderColor: '#D7C5B780',
    borderRadius: 8,
    borderTopStartRadius: 0,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 5,
  },
  notesContentContainer: {
    flexGrow: 1,
  },
  notesText: {
    fontFamily: 'Nunito-Medium',
    color: '#574E47',
    textAlign: 'left',
    paddingBottom: 5,
  },
});

export default FindingModal;
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  ImageBackground,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { deleteFinding, fetchUserFindings } from '../../Service/Fetch';
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import FindingItem from './FindingItem';
import FindingModal from './FindingModal';
import { useFocusEffect } from '@react-navigation/native';

export default function FindingsScreen({ route, navigation }) {
  // Extract params
  const { mushroomId, mushroomName, mushroomCommonName } = route.params;

  // State
  const [findingsData, setFindingsData] = useState([]);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dimensions for responsive layout
  const { height } = useWindowDimensions();

  // Toast message helper function
  const showToast = (type, message) => {
    Toast.show({
      type: type,
      text1: message,
      position: "bottom",
      visibilityTime: 3000,
      autoHide: true,
    });
  };

  // Fetch findings data function
  const fetchFindingsData = useCallback(async (showLoadingState = true) => {

    if (showLoadingState) setIsLoading(true);

    try {
      const result = await fetchUserFindings();

      if (!result.error) {
        const filteredFindings = result.filter(
          (finding) => finding?.mushroom?.m_id === mushroomId
        );
        setFindingsData(filteredFindings);
      } else if (result.error === "No JWT token found.") {
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Error fetching findings:", error);
      showToast("error", "Failed to load findings");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [mushroomId, navigation]);

  // Initial data load
  useEffect(() => {
    fetchFindingsData();
  }, [fetchFindingsData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Slight delay to avoid performance issues with navigation animations
      const timer = setTimeout(() => fetchFindingsData(false), 300);
      return () => clearTimeout(timer);
    }, [fetchFindingsData])
  );

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);

    // Just fetch fresh data when user explicitly refreshes
    fetchFindingsData(false);
  }, [fetchFindingsData]);

  // Modal management
  const openModal = useCallback((finding) => {
    setSelectedFinding({
      ...finding,
      mushroomName: mushroomName,
      mushroomCommonName: mushroomCommonName
    });
    setModalVisible(true);
  }, [mushroomName, mushroomCommonName]);

  const closeModal = useCallback(() => {
    setSelectedFinding(null);
    setModalVisible(false);
  }, []);

  // Delete finding functionality
  const confirmDelete = useCallback(() => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this finding?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: handleDeleteFinding,
          style: "destructive"
        }
      ]
    );
  }, [selectedFinding]);

  const handleDeleteFinding = useCallback(async () => {
    console.log("Selected finding for deletion:", selectedFinding);

    if (!selectedFinding || !selectedFinding.f_Id) {
      console.error("Missing ID or selectedFinding");
      showToast("error", "Error deleting finding. Please try again.");
      return;
    }

    try {
      const result = await deleteFinding(selectedFinding.f_Id);

      if (result.success) {
        setFindingsData(prev => prev.filter(finding => finding.f_Id !== selectedFinding.f_Id));
        closeModal();
        showToast("success", "Finding deleted successfully");
      } else {
        console.error("Failed to delete finding:", result.error);
        showToast("error", "Failed to delete finding. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting finding:", error);
      showToast("error", "Error occurred while deleting finding.");
    }
  }, [selectedFinding, closeModal]);

  // Render item function for FlatList
  const renderItem = useCallback(({ item, index }) => {
    const isTopRow = index < 3;
    const isBottomRow = index >= findingsData.length - (findingsData.length % 3 || 3);

    return (
      <FindingItem
        item={item}
        index={index}
        onPress={openModal}
        isTopRow={isTopRow}
        isBottomRow={isBottomRow}
      />
    );
  }, [findingsData.length, openModal]);

  // Calculate dynamic container style based on screen dimensions
  const calculateContainerStyle = useCallback(() => {
    const headerHeight = 110; // Title container + margins
    const bottomSafeMargin = 60; // Increased bottom margin for safety
    const statusBarHeight = 40; // Approximate status bar height

    // Calculate available height
    const safeHeight = height - headerHeight - bottomSafeMargin - statusBarHeight;

    return {
      ...styles.contentContainer,
      maxHeight: Math.min(safeHeight, height * 0.65), // Never more than 65% of screen height
    };
  }, [height]);

  // Render empty list component
  const renderEmptyComponent = useCallback(() => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="images-outline" size={50} color="#574E47" style={{ marginBottom: 20 }} />
      <Text style={styles.emptyStateText}>No findings available for this mushroom.</Text>
      <Text style={styles.emptyStateSubtext}>Add a new finding when you discover one!</Text>
    </View>
  ), []);

  return (
    <ImageBackground
      source={require("../../assets/Backgrounds/sieni-bg.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header Container */}
        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{String(mushroomCommonName) || 'No Mushroom Name Available'}</Text>
            <Text style={styles.subtitle}>{String(mushroomName) || 'No Mushroom Name Available'}</Text>
          </View>
        </View>

        {/* Findings Grid Container */}
        <View style={calculateContainerStyle()}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#574E47" />
              <Text style={styles.loadingText}>Loading findings...</Text>
            </View>
          ) : (
            <FlatList
              data={findingsData}
              renderItem={renderItem}
              keyExtractor={(item, index) => (item?.f_Id ? item.f_Id.toString() : index.toString())}
              numColumns={3}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              ListEmptyComponent={renderEmptyComponent}
              onRefresh={handleRefresh}
              refreshing={isRefreshing}
            />
          )}
        </View>

        {/* Modal for showing details of found mushroom */}
        <Modal visible={modalVisible} transparent animationType="fade">
            <View style={styles.modalContainer}>
                <FindingModal
                  finding={selectedFinding}
                  onClose={closeModal}
                  onDelete={confirmDelete}
                />
            </View>
        </Modal>
      </View>

      {/* Toast message component */}
      <Toast />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // ============= CONTAINER & LAYOUT STYLES =============
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  titleContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.93)",
    borderRadius: 20,
    padding: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: '100%',
    position: 'relative',
    borderColor: '#D7C5B7',
    borderWidth: 3,
  },
  contentContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.93)",
    borderRadius: 20,
    paddingHorizontal: 20,
    marginBottom: 40,
    borderColor: '#D7C5B7',
    borderWidth: 3,
    minHeight: 100,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingTop: 10,
    borderRadius: 20,
    paddingBottom: 10,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    minHeight: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#574E47',
    fontFamily: 'Nunito-Medium',
  },

  // ============= TEXT STYLES =============
  title: {
    fontSize: 24,
    color: '#574E47',
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#574E47',
    textAlign: 'center',
    fontFamily: 'Nunito-Italic',
    marginBottom: 5,
  },

  // ============= THUMBNAIL GRID STYLES =============
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },

  // ============= EMPTY STATE STYLES =============
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 300,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#574E47',
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#574E47',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Nunito-MediumItalic',
  },

  // ============= MODAL STYLES =============
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
import React, { useCallback, useContext, useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, Button, TouchableOpacity, Modal, Image, TextInput, FlatList, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from "react-native";
import { AuthContext } from "../Service/AuthContext";
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { fetchMushroomsData } from "../Service/Fetch";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { checkAIServerStatus, optimizeImageForAI, sendImageToAIService, findBestMushroomMatch, formatAIResults } from "../Service/AIService";
import { ImageBackground } from "react-native";
import ToxicityIndicator from "../Components/ToxicityIndicator";

export default function HomeScreen() {
  const { user, loading } = useContext(AuthContext);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // CAMERA STATES
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef(null);
  const [takingPhoto, setTakingPhoto] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  // Photo and mushroom states
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [image, setImage] = useState(null);
  const [mushroomId, setMushroomId] = useState("");
  const [mushroomList, setMushroomList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [returnFromFinding, setReturnFromFinding] = useState(false);

  // AI processing states
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [serverStatus, setServerStatus] = useState("checking");
  const [aiResults, setAiResults] = useState({
    model1: [],
    model2: [],
    model3: [],
    model4: [],
    model5: [],
  });

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

  // Manage camera mounting/unmounting based on screen focus
  useEffect(() => {
    // When the screen gains focus, activate the camera if we have permission
    if (isFocused && permission?.granted && !photoModalVisible) {
      console.log("Screen focused, activating camera");
      setCameraActive(true);
    }
    // When modal is visible or screen loses focus, deactivate camera
    else {
      console.log("Deactivating camera");
      setCameraActive(false);
    }
  }, [isFocused, permission?.granted, photoModalVisible]);

  // Check AI server status periodically, but only when screen is focused
  useFocusEffect(
    useCallback(() => {
      const checkServerStatus = async () => {
        setServerStatus("checking");
        const isAvailable = await checkAIServerStatus();
        setServerStatus(isAvailable ? "available" : "unavailable");
      };

      // Check server status when screen gains focus
      checkServerStatus();

      // Set up periodic checking (30 seconds)
      const intervalId = setInterval(checkServerStatus, 30000);

      // Clean up interval when screen loses focus
      return () => {
        console.log("Cleaning up server status check interval");
        clearInterval(intervalId);
      };
    }, [])
  );

  // Check if returning from CreateFinding with preserved data
  useFocusEffect(
    useCallback(() => {
      if (returnFromFinding && photoUri) {
        setPhotoModalVisible(true);
      }
      return () => { };
    }, [returnFromFinding, photoUri])
  );

  // Fetch mushroom data
  useEffect(() => {
    const fetchMushrooms = async () => {
      const result = await fetchMushroomsData();
      if (!result.error) {
        setMushroomList(result);
      } else if (result.error === "No JWT token found.") {
        navigation.navigate("Login");
      }
    };

    fetchMushrooms();
  }, []);

  // Request camera permissions
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  // Function to toggle camera facing
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Take photo function with AI processing
  const takePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      setTakingPhoto(true);
      showToast("info", "Taking photo...");

      // Take the photo
      const photo = await cameraRef.current.takePictureAsync();

      // Deactivate camera while showing the modal
      setCameraActive(false);

      // Show modal with the photo
      setPhotoModalVisible(true);

      // Optimize the image for better performance
      const optimizedImage = await optimizeImageForAI(photo.uri);
      if (!optimizedImage) {
        showToast("error", "Failed to process image");
        return;
      }

      setPhotoUri(optimizedImage.uri);
      setImage(optimizedImage);
      setReturnFromFinding(false);

      // Check server status right when taking photo
      setServerStatus("checking");
      const isServerAvailable = await checkAIServerStatus();
      setServerStatus(isServerAvailable ? "available" : "unavailable");

      // Process with AI if server is available
      if (isServerAvailable) {
        processImageWithAI(optimizedImage);
      } else {
        showToast("error", "AI server unavailable. Image recognition disabled.");
      }
    } catch (error) {
      showToast("error", "Failed to capture photo: " + error.message);
      console.error("Camera error:", error);
    } finally {
      setTakingPhoto(false);
    }
  };

  // Show server status in UI
  const renderStatusIndicator = () => {
    if (serverStatus === "available") {
      return (
        <View style={styles.statusIndicatorWrapper}>
          <View style={styles.statusIndicatorOnline}>
            <Text style={styles.statusIndicatorText}>AI server online</Text>
          </View>
        </View>
      );
    } else if (serverStatus === "checking") {
      return (
        <View style={styles.statusIndicatorWrapper}>
          <View style={styles.statusIndicatorChecking}>
            <Text style={styles.statusIndicatorText}>Checking AI server...</Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.statusIndicatorWrapper}>
          <View style={styles.statusIndicatorUnavailable}>
            <Text style={styles.statusIndicatorText}>AI server offline - Image recognition disabled</Text>
          </View>
        </View>
      );
    }
  };

  // If user closes modal reset states and reactivate camera
  const closeModal = () => {
    setMushroomId("");
    setPhotoUri(null);
    setReturnFromFinding(false);
    setPhotoModalVisible(false);

    // Reactivate camera if screen is still focused
    if (isFocused && permission?.granted) {
      setCameraActive(true);
    }
  };

  // Process image with AI and handle results
  const processImageWithAI = async (imageData) => {
    try {
      setLoadingAI(true);
      setAiProgress(0);

      // Call AI service with progress updates
      const aiData = await sendImageToAIService(imageData, (progress) => {
        setAiProgress(progress);
      });

      if (!aiData) {
        throw new Error("No data received from AI service");
      }

      // Process and store results
      const results = {
        model1: aiData.model1_prediction?.predictions || [],
        model2: aiData.model2_prediction?.predictions || [],
        model3: aiData.model3_prediction?.predictions || [],
        model4: aiData.model4_prediction?.predictions || [],
        model5: aiData.model5_prediction?.predictions || [],
      };

      setAiResults(results);

      // Try to auto-select the best mushroom match
      const matchedMushroom = findBestMushroomMatch({
        model2_prediction: { predictions: results.model2 }
      }, mushroomList);

      if (matchedMushroom) {
        setMushroomId(matchedMushroom.m_id.toString());
        showToast("info", `Auto-selected "${matchedMushroom.mname}"`);
      }

      showToast("success", "AI analysis complete!");
    } catch (error) {
      console.error("AI processing error:", error);

      if (error.name === 'AbortError') {
        showToast("error", "AI processing timeout. Try again or proceed without AI.");
      } else {
        showToast("error", "Failed to analyze image: " + error.message);
      }
    } finally {
      setLoadingAI(false);
    }
  };

  // Filter mushroom list based on search text
  const filteredMushroomList = useMemo(() => {
    const searchLower = searchText.toLowerCase().trim();

    // Special case for toxicity level exact matches
    if (searchLower === "low" || searchLower === "medium" || searchLower === "high") {
      return mushroomList.filter(item =>
        item.toxicity_level.toLowerCase() === searchLower
      );
    }

    // Regular search across all fields
    return mushroomList.filter(item =>
      item.mname.toLowerCase().includes(searchLower) ||
      item.cmname.toLowerCase().includes(searchLower) ||
      item.toxicity_level.toLowerCase().includes(searchLower)
    );
  }, [mushroomList, searchText]);

  // Memoize the formatted AI results
  const aiFormattedResults = useMemo(() =>
    formatAIResults(aiResults, mushroomList),
    [aiResults, mushroomList]
  );

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Return empty view if permission status is not determined
  if (!permission) return <View />;

  // Show permission request if not granted
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
        <Button
          title="Profile"
          onPress={() => navigation.navigate('Profile')}
        />
      </View>
    );
  }

  // Main render
  return (
    <View style={styles.container}>
      {/* CAMERA VIEW - conditional rendering */}
      {cameraActive ? (
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
          >
            {/* Camera content */}
            <View style={styles.cameraContentContainer}>
              {takingPhoto ? (
                <View style={styles.centeredLoadingContainer}>
                  <View>
                    <ActivityIndicator size="large" color="white" />
                  </View>
                </View>
              ) : (
                // When not taking photo, show normal camera UI
                <>
                  {/* Top row for toggle camera button and status indicators */}
                  <View style={styles.cameraTopRow}>
                    <View style={styles.statusIndicator}>
                      {renderStatusIndicator()}
                    </View>
                    <TouchableOpacity style={styles.toggleCameraButton} onPress={toggleCameraFacing}>
                      <Ionicons name="sync-circle-outline" size={40} color="white" />
                    </TouchableOpacity>
                  </View>

                  {/* Bottom area for capture button */}
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={takePhoto}>
                      <Ionicons name="radio-button-on-outline" size={90} color="white" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </CameraView>
        </View>
      ) : (
        // Show a placeholder when camera is inactive
        <View style={styles.cameraPlaceholder}></View>
      )}

      {/* PHOTO MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={photoModalVisible}
        onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <ImageBackground
              source={require('../assets/Backgrounds/sieni-bg.jpg')}
              style={styles.modalContainer}
              resizeMode="cover"
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContentContainer}>
                  <Text style={styles.titleText}>Select the mushroom you found!</Text>

                  <View style={styles.photoAndAIContainer}>
                    <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />

                    {/* AI RESULT BLOCK */}
                    <View style={styles.aiResultsContainer}>
                      {loadingAI ? (
                        <View style={styles.aiLoadingContainer}>
                          <ActivityIndicator size="large" color="#574E47" />
                          <Text style={styles.aiLoadingText}>Analyzing mushroom...</Text>

                          {/* Progress bar */}
                          <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBar, { width: `${aiProgress}%` }]} />
                          </View>
                          <Text style={styles.aiLoadingText}>{Math.round(aiProgress)}% complete</Text>
                        </View>
                      ) : (
                        <View style={styles.AIGridContainer}>
                          {aiFormattedResults.map((result, index) => (
                            <TouchableOpacity
                              key={index}
                              style={
                                mushroomId === result.mushroomId?.toString()
                                  ? styles.selectedListButton
                                  : styles.ListButton
                              }
                              onPress={() => {
                                if (result.mushroomId) {
                                  if (mushroomId === result.mushroomId.toString()) {
                                    setMushroomId("");
                                  } else {
                                    setMushroomId(result.mushroomId.toString());
                                  }
                                }
                              }}
                              disabled={!result.mushroomId}
                            >
                              <View style={styles.aiPredictionRow}>
                                <View style={styles.aiNameContainer}>
                                  <Text style={styles.aiListCommon}>{result.class}</Text>
                                  {result.latinName && (
                                    <Text style={styles.aiListLatin}>{result.latinName}</Text>
                                  )}
                                </View>
                                <View style={styles.aiConfidenceContainer}>
                                  <Text style={styles.AIConfidenceText}>{result.confidence}</Text>
                                </View>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.separator} />

                  {/* SEARCH BAR */}
                  <View style={styles.searchContainer}>
                    <TextInput
                      style={styles.searchBar}
                      placeholder="Search mushrooms..."
                      placeholderTextColor="#999"
                      value={searchText}
                      onChangeText={setSearchText}
                    />
                  </View>

                  {/* MUSHROOM LIST */}
                  <View style={styles.listContainer}>
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
                            if (mushroomId === item.m_id.toString()) {
                              setMushroomId("");
                            } else {
                              setMushroomId(item.m_id.toString());
                            }
                          }}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.ListCommon}>{item.cmname}</Text>
                              <Text style={styles.ListLatin}>{item.mname}</Text>
                            </View>
                            <View style={styles.toxicityContainer}>
                              <Text style={styles.ToxicityListText}>Toxicity</Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <ToxicityIndicator toxicity_level={item.toxicity_level} />
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}
                      style={{ maxHeight: 200, width: '100%' }}
                    />
                  </View>

                  {/* BUTTON ROW */}

                  {/* Create finding button */}
                  <TouchableOpacity
                    style={[styles.modalButton, !mushroomId && styles.disabledButton]}
                    disabled={!mushroomId}
                    onPress={() => {
                      if (!mushroomId) {
                        showToast("error", "Please select a mushroom first");
                        return;
                      }

                      const selectedMushroom = mushroomList.find(m => m.m_id.toString() === mushroomId);
                      setReturnFromFinding(true);

                      navigation.navigate('CreateFinding', {
                        photoUri,
                        mushroomId,
                        image,
                        mushroomCommonName: selectedMushroom ? selectedMushroom.cmname : null,
                        mushroomLatinName: selectedMushroom ? selectedMushroom.mname : null
                      });

                      setPhotoModalVisible(false);
                    }}>
                    <Text style={styles.modalCreateBtnText}>Create a finding</Text>
                  </TouchableOpacity>

                  {/* Close button */}
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={closeModal}>
                    <Text style={styles.modalCloseBtnText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </View>
        </TouchableWithoutFeedback>
        <Toast />
      </Modal >
    </View >
  );
}

const styles = StyleSheet.create({
  // ============= CONTAINER & LAYOUT STYLES =============
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  message: {
    fontFamily: "Nunito-Bold",
    textAlign: 'center',
    paddingBottom: 10,
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#ccc',
    marginVertical: 10,
  },

  // ============= CAMERA STYLES =============
  camera: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#574E47',
    overflow: 'hidden',
  },
  cameraContentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  cameraTopRow: {
    flexDirection: 'row',
    paddingTop: 20,
    paddingRight: 20,
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
  },
  button: {
    alignItems: 'center',
    position: 'center',
    width: 90,
    height: 90,
  },
  toggleCameraButton: {
    padding: 0,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    width: '100%',
  },
  centeredLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  // ============= STATUS INDICATOR STYLES =============
  statusIndicator: {
    flex: 1,
    paddingLeft: 20,
    alignItems: 'flex-start',
  },
  statusIndicatorOnline: {
    flexDirection: 'row',
    backgroundColor: 'rgba(46, 204, 113, 0.7)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    minWidth: 24,
  },
  statusIndicatorChecking: {
    flexDirection: 'row',
    backgroundColor: 'rgba(243, 156, 18, 0.7)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    minWidth: 24,
  },
  statusIndicatorUnavailable: {
    flexDirection: 'row',
    backgroundColor: 'rgba(231, 76, 60, 0.7)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    minWidth: 24,
  },
  statusIndicatorText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
    marginRight: 2,
    fontFamily: 'Nunito-Bold',
  },
  statusIndicatorWrapper: {
    alignItems: 'flex-start',
  },

  // ============= MODAL STYLES =============
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalOverlay: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 30,
    width: "90%",
    maxHeight: "90%",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 5,
    borderColor: '#D7C5B7',
  },
  photoAndAIContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  photo: {
    width: '35%',
    height: 190,
    borderRadius: 10,
    borderColor: '#D7C5B7',
    borderWidth: 2,
    marginRight: 10,
    resizeMode: 'cover',
  },
  modalButton: {
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    borderWidth: 2,
    borderColor: "#574E47",
    backgroundColor: "#574E47",
    width: 200,
    alignSelf: "center",
  },
  modalCancelButton: {
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D7C5B7",
    width: 200,
    alignSelf: "center",
  },
  modalCreateBtnText: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
  },
  modalCloseBtnText: {
    color: '#574E47',
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  toxicityContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50
  },
  ToxicityListText: {
    fontSize: 13,
    color: '#574E47',
    fontFamily: 'Nunito-Medium',
    textAlign: 'center',
    marginBottom: 3
  },
  // ============= AI ANALYSIS STYLES =============
  aiResultsContainer: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 0,
  },
  titleText: {
    fontSize: 22,
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#574E47',
  },
  aiLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    width: '100%',
  },
  aiLoadingText: {
    color: '#574E47',
    marginTop: 10,
    fontSize: 14,
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.93)',
    borderWidth: 1,
    borderColor: '#574E47',
    borderRadius: 4,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D7C5B7',
  },

  // ============= AI RESULTS DISPLAY STYLES =============
  AIGridContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  AIConfidenceText: {
    fontSize: 14,
    color: '#574E47',
    fontFamily: 'Nunito-Bold',
  },
  aiResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiResultInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  aiResultConfidence: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  aiPredictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  aiNameContainer: {
    flex: 1,
    width: '60%',
    justifyContent: 'center',
    flexShrink: 1,
    overflow: 'hidden',
  },
  aiConfidenceContainer: {
    width: 38,
    borderLeftWidth: 1,
    borderColor: '#574E47',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  aiResultsList: {
    width: '100%',
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#D7C5B7',
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  aiListCommon: {
    fontSize: 14,
    color: '#574E47',
    fontFamily: 'Nunito-Bold',
  },
  aiListLatin: {
    fontSize: 10,
    color: '#574E47',
    fontFamily: 'Nunito-Italic',
  },

  // ============= SEARCH AND LIST STYLES =============
  searchContainer: {
    width: '90%',
    padding: 5,
    marginTop: 10,
  },
  searchBar: {
    height: 40,
    borderColor: "rgba(72, 56, 38, 0.57)",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "rgba(232, 230, 228, 0.4)",
    width: '100%',
    textAlign: "center",
    fontFamily: 'Nunito-Medium',
  },
  listContainer: {
    width: '90%',
    marginTop: 10,
  },
  ListCommon: {
    fontSize: 18,
    color: '#574E47',
    fontFamily: 'Nunito-Bold',
  },
  ListLatin: {
    fontSize: 14,
    color: '#574E47',
    fontFamily: 'Nunito-Italic',
  },
  ListButton: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#D7C5B7',
  },
  selectedListButton: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#D7C5B780',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#D7C5B7',
  },
});
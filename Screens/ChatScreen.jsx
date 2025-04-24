import React, { useEffect, useState, useRef, useContext } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, InteractionManager, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ImageBackground, Modal, Image, TouchableWithoutFeedback } from "react-native";
import { Client } from "@stomp/stompjs";
import profilePictureMap from "../Components/ProfilePictureMap.js";
import { AuthContext } from "../Service/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchCurrentUser, fetchUserProfileByUsername, fetchUserFindings } from "../Service/Fetch.js";
import { API_SOCKET_URL, API_CHAT_HISTORY } from "@env";
import { Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MushroomIcon from "../assets/chaticons/mushroomIcon.png"
import ToxicityIndicator from "../Components/ToxicityIndicator";
const ChatScreen = () => {
  const { user, setUser } = useContext(AuthContext); // Retrieve user information from AuthContext
  const [messages, setMessages] = useState([]); // Stores chat messages
  const [input, setInput] = useState(""); // Stores input message
  const [username, setUsername] = useState("Anonymous"); // Default username
  const [chatColor, setChatColor] = useState("#000"); // Default text color for messages
  const [userProfile, setUserProfile] = useState({}); // Store user profile
  const [uniqueMushrooms, setUniqueMushrooms] = useState(0);
  const clientRef = useRef(null); // Ref for WebSocket client
  const flatListRef = useRef(null); // Ref for FlatList to enable auto-scrolling
  const [foundMushrooms, setFoundMushrooms] = useState([]);
  const [selectedFinding, setSelectedFinding] = useState(null); // Selected finding details
  const [findingPhotos, setFindingPhotos] = useState([]); // Photos of findings for a mushroom
  const [activeModal, setActiveModal] = useState(null); // null | "profile" | "findings" | "mushroom" | "findingDetails"


  // Fetch user details when navigating to ChatScreen
  useFocusEffect(
    React.useCallback(() => {
      const fetchUserDetails = async () => {
        const userData = await fetchCurrentUser(setUser);
        if (userData && !userData.error) {
          setUsername(userData.username || "Anonymous");
          setChatColor(userData.chatColor || "#000");
        }
      };
      fetchUserDetails();
    }, [])
  );
  useFocusEffect(
    React.useCallback(() => {
      const restoreAndFetchMessages = async () => {
        try {
          const savedMessages = await AsyncStorage.getItem("chatMessages");

          let localMessages = [];
          if (savedMessages) {
            try {
              localMessages = JSON.parse(savedMessages);
              console.log("Parsed saved messages:", localMessages);
            } catch (parseError) {
              console.error("Failed to parse savedMessages", parseError);
            }
          }
          const token = await AsyncStorage.getItem("jwtToken");

          const response = await fetch(`${API_CHAT_HISTORY}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });


          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const serverMessages = await response.json();

          const mergedMessages = [...localMessages, ...serverMessages]
            .filter((msg, index, self) =>
              index === self.findIndex((m) => m.timestamp === msg.timestamp && m.username === msg.username)
            )
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

          setMessages(mergedMessages);

          await AsyncStorage.setItem("chatMessages", JSON.stringify(mergedMessages));
        } catch (err) {
          console.error("Failed to restore or fetch messages", err);
        }
      };

      restoreAndFetchMessages();
    }, [])
  );

  // WebSocket connection (runs only once)
  useEffect(() => {
    const connectWebSocket = async () => {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        console.warn("No token found, unable to authenticate WebSocket.");
        return;
      }

      // Initialize WebSocket client with authentication
      const client = new Client({
        brokerURL: `${API_SOCKET_URL}?token=${token}`,
        debug: (str) => console.log("STOMP Debug:", str),
        reconnectDelay: 5000, // Attempt reconnection every 5 seconds
        heartbeatIncoming: 10000, // Incoming heartbeat every 10 seconds
        heartbeatOutgoing: 10000, // Outgoing heartbeat every 10 seconds
        forceBinaryWSFrames: true, // For iOS WebSocket (does not work without it)
        appendMissingNULLonIncoming: true, // Helps prevent parsing issues
        onConnect: () => {
          console.log("WebSocket connected!");
          client.subscribe("/topic/publicChat", async (message) => {
            console.log("Received:", message.body);
            const parsedMessage = JSON.parse(message.body);
            const currentFindings = await fetchUserFindings();
            const uniquePhotos = extractUniqueFoundMushrooms(currentFindings);

            parsedMessage.findingPhotos = uniquePhotos; // Attach to message
            addMessage(parsedMessage); // Use the new addMessage function
          });
        },
        onStompError: (frame) => console.error("STOMP error:", frame.headers["message"]),
        onWebSocketClose: () => console.warn("WebSocket disconnected."),
        onWebSocketError: (event) => console.error("WebSocket error:", event),
      });

      client.activate();
      clientRef.current = client;
    };

    connectWebSocket();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        console.log("WebSocket connection closed.");
      }
    };
  }, []); // Dependency array ensures this runs only once

  // Function to send messages via WebSocket
  const sendMessage = () => {
    if (clientRef.current && clientRef.current.connected) {
      // Validate selectedFinding and ensure it contains valid data
      const mushroomTag = selectedFinding && selectedFinding.mushroomName
        ? `[mushroom:${selectedFinding.mushroomName}|${selectedFinding.photoUri || "NoImage"}|${selectedFinding.mname || "NoDescription"}|${selectedFinding.toxicity_level || "NoDescription"}|${selectedFinding.foundBy}]`
        : "";
      // Remove the first mention of the mushroom name from the input if a finding is selected
      let messageInput = input.trim();
      if (selectedFinding && selectedFinding.mushroomName) {
        const mushroomNameRegex = new RegExp(`\\b${selectedFinding.mushroomName}\\b`, "i");
        messageInput = messageInput.replace(mushroomNameRegex, "").trim();
      }
      // Construct the final message text
      const messageText = `${messageInput} ${mushroomTag}`.trim();

      clientRef.current.publish({
        destination: "/app/send",
        body: JSON.stringify({
          text: messageText, // Include the cleaned input and the mushroom tag
          username: username, // Send username
          chatColor: chatColor, // Send chat color
          timestamp: new Date().toISOString(),
        }),
      });

      setInput(""); // Clear input field after sending message
      setSelectedFinding(null); // Clear the selected finding

    } else {
      console.warn("WebSocket not connected.");
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100); 
      });
    });
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);




  // function to fetch user profile data
  const fetchUserProfileData = async (clickedUsername) => {
    try {
      const profileData = await fetchUserProfileByUsername(clickedUsername);

      if (profileData && !profileData.error) {
        if (profileData.uniqueMushrooms && Array.isArray(profileData.uniqueMushrooms)) {
          const uniqueMushroomsSet = new Set(profileData.uniqueMushrooms);
          setUniqueMushrooms(uniqueMushroomsSet.size);  // Set size gives the number of unique mushrooms
        } else {
          setUniqueMushrooms(0);  // If no mushrooms or error, set to 0
        }

        setUserProfile(profileData);
        setActiveModal('profile'); // Show modal with user profile
      } else {
        console.error("Profile not found");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Function to handle username click
  const handleUsernameClick = (username) => {
    fetchUserProfileData(username);
  };

  const extractUniqueFoundMushrooms = (findings) => {
    const unique = {};
    findings.forEach((finding) => {
      const mushroom = finding.mushroom;
      if (!unique[mushroom.m_id]) {
        unique[mushroom.m_id] = mushroom;
      }
    });
    return Object.values(unique);
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchFindings = async () => {
        const data = await fetchUserFindings();
        if (data && !data.error) {
          const uniqueMushrooms = extractUniqueFoundMushrooms(data);
          setFoundMushrooms(uniqueMushrooms);
        }
      };
      fetchFindings();
    }, [])
  );

  // Function to fetch findings for a selected mushroom
  const fetchFindingsForMushroom = async (mushroomId) => {
    const findings = await fetchUserFindings();
    if (findings && !findings.error) {
      const filteredFindings = findings.filter(f => f.mushroom.m_id === mushroomId);
      setFindingPhotos(filteredFindings);
      setActiveModal('findingDetails');
    }
  };

  // Function to handle finding selection
  const handleFindingSelection = (finding) => {
    if (!finding || !finding.mushroom || !finding.mushroom.cmname) {
      console.warn("Invalid finding selected:", finding);
      return;
    }
    setInput((prevInput) => {
      // Check if the mushroom name already exists in the input
      if (prevInput.includes(finding.mushroom.cmname)) {
        return prevInput;
      }

      return `${prevInput} ${finding.mushroom.cmname}`.trim();
    });

    setSelectedFinding({
      mushroomName: finding.mushroom.cmname,
      photoUri: finding.imageURL || null,
      mname: finding.mushroom.mname || "N/A",
      toxicity_level: finding.mushroom.toxicity_level || "N/A",
      foundBy: finding.appuser.username || "Anonymous",

    });
    setActiveModal(null);
  };

  const handleFindingClick = (mushroomDetails) => {
    try {
      const { mushroomName, photoUri, mname, toxicity_level, foundBy } = mushroomDetails;

      // checker to see if photoUri is a valid URL or a local file path
      const formattedPhotoUri = photoUri && !photoUri.startsWith("http")
        ? `${API_BASE_URL}/images/${photoUri}`
        : photoUri;

      setSelectedFinding({
        mushroomName: mushroomName || "Unknown Mushroom",
        photoUri: formattedPhotoUri !== "NoImage" ? formattedPhotoUri : null,
        mname: mname || "N/A",
        toxicity_level: toxicity_level || "N/A",
        foundBy: mushroomDetails.foundBy || "Anonymous",
      });

      setActiveModal('findings');
    } catch (error) {
      console.error("Error in handleFindingClick:", error);
    }
  };

  // FUNCTION TO SHOW FINDING DETAILS IN MODAL
  const showFindingDetails = (finding) => {
    setSelectedFinding(finding);
    setActiveModal('findings');
  };

  const renderMessageSegments = (item) => {
    const segments = [];
    const mushroomRegex = /\[mushroom:(.*?)\|(.*?)\|(.*?)\|(.*?)\|(.*?)\]/g;

    let lastIndex = 0;

    // Parses the text for mushroom tags
    item.text.replace(mushroomRegex, (match, mushroomName, photoUri, mname, toxicity_level, foundBy, offset) => {
      // Add plain text before the mushroom tag
      if (offset > lastIndex) {
        segments.push({ text: item.text.slice(lastIndex, offset), isLink: false });
      }

      // Add the mushroom tag as a clickable link
      segments.push({
        text: mushroomName,
        isLink: true,
        mushroomDetails: { mushroomName, photoUri, mname, toxicity_level, foundBy },
      });
      lastIndex = offset + match.length;
    });

    // Add remaining plain text after the last mushroom tag
    if (lastIndex < item.text.length) {
      segments.push({ text: item.text.slice(lastIndex), isLink: false });
    }

    // Map over segments and render them
    return segments.map((segment, index) => {
      if (segment.isLink) {
        return (
          <TouchableOpacity
            key={`${item.timestamp}-link-${index}`}
            onPress={() => handleFindingClick(segment.mushroomDetails)}
          >
            <Text
              style={[
                styles.linkText]}>
              {segment.text}
            </Text>
          </TouchableOpacity>
        );
      }

      return (
        <Text key={`${item.timestamp}-text-${index}`} style={styles.messageText}>
          {segment.text}
        </Text>
      );
    });
  };

  // UPDATE UI WHEN 50 MESSAGES ARE REACHED
  const addMessage = (newMessage) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, newMessage];
      if (updatedMessages.length > 50) {
        updatedMessages.shift();
      }
      AsyncStorage.setItem("chatMessages", JSON.stringify(updatedMessages)).catch((err) =>
        console.error("Failed to save messages", err)
      );
      return updatedMessages;
    });
  };

  return (
    <ImageBackground
      source={require('../assets/Backgrounds/sieni-bg.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 70}
      >
        {/* CHAT FLATLIST*/}
        <FlatList
          ref={flatListRef}
          data={[...messages].reverse()} // reverse the array to show newest at the bottom
          keyExtractor={(item, index) => index.toString()}
          inverted={true} // this flips the list so bottom is shown first
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const isOwnMessage = item.username === username;
            return (
              <View
                style={[
                  styles.messageContainer,
                  {
                    backgroundColor: item.chatColor || "#000",
                    alignSelf: isOwnMessage ? "flex-end" : "flex-start",
                  },
                ]}
              >
                <TouchableOpacity onPress={() => handleUsernameClick(item.username)}>
                  <Text style={styles.username}>{item.username}</Text>
                </TouchableOpacity>

                <View style={styles.messageTextContainer}>
                  {renderMessageSegments(item)}
                </View>
              </View>
            );
          }}
        />


        {/* CHAT INPUT */}
        <View style={[styles.inputContainerBox]}>
          {/* Mushroom Icon */}
          <TouchableOpacity onPress={() => setActiveModal('mushroom')}>
            <Image source={MushroomIcon} style={{ width: 35, height: 35, resizeMode: 'contain', }} />
          </TouchableOpacity>

          {/* Input Text */}
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message"
            style={styles.input}
            onFocus={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: false })}
          />
          {/* Send Button */}
          <TouchableOpacity onPress={sendMessage} style={styles.sendButtonCircle}>
            <Ionicons name="send" size={22} color="#fff" paddingLeft={3} />
          </TouchableOpacity>
        </View>


        {/* MODALS-> PROFILE, FINDINGS, MUSHROOM AND FINDING DETAILS */}
        <Modal
          visible={activeModal !== null}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setActiveModal(null)}
        >
          <TouchableWithoutFeedback onPress={() => setActiveModal(null)}>
            <View style={styles.modalContainer}>
              {activeModal === "profile" && (
                <View style={styles.modalContainer}>
                  <View style={styles.profileModalContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                      {userProfile.profilePicture && (
                        <Image
                          source={profilePictureMap[userProfile.profilePicture]}
                          style={styles.profileImage}
                        />
                      )}
                      <View style={{ flexDirection: 'column', alignItems: 'end', gap: 2 }}>
                        <Text style={styles.profileUsername} numberOfLines={1} adjustsFontSizeToFit>
                          {userProfile.username}
                        </Text>
                        <View style={styles.hr} />
                        <View style={{ flexDirection: 'row', gap: 2 }}>
                          <Text style={styles.infoTextLabel}>Level:</Text>
                          <Text style={styles.infoTextValue}>{userProfile.level}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 2 }}>
                          <Text style={styles.infoTextLabel}>Unique Mushrooms:</Text>
                          <Text style={styles.infoTextValue}>{uniqueMushrooms}</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {activeModal === "findings" && (
                <View style={styles.modalContainer}>
                  <View style={styles.findingModalContent}>
                    <View style={styles.modalRowContainer}>
                      <Text style={styles.modalSubHeader}>Found by: </Text>
                      <Text>{selectedFinding?.foundBy || "N/A"}</Text>
                    </View>
                    {selectedFinding?.photoUri ? (<Image source={{ uri: selectedFinding.photoUri }} style={styles.findingPhoto} />)
                      : (<Text>No image available</Text>
                      )}
                    <Text style={styles.modalTitle}>{selectedFinding?.mname || 'Unknown Mushroom'}</Text>
                    <Text>{selectedFinding?.mushroomName || "N/A"}</Text>
                    <View style={styles.modalRowContainer}>
                      <Text style={styles.modalSubHeader}>Toxicity level: </Text>
                      <ToxicityIndicator toxicity_level={selectedFinding?.toxicity_level} />
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setActiveModal(null);
                        setSelectedFinding(null);
                      }} style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {activeModal === "mushroom" && (
                <View style={styles.modalContainer}>

                  <View style={styles.modalContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 16, paddingTop: 16 }}>
                      <Text style={styles.modalTitle}>Select a Mushroom</Text>
                      <Image source={MushroomIcon} style={{ width: 30, height: 30 }} />
                    </View>
                    <FlatList
                      data={foundMushrooms}
                      keyExtractor={(item) => item.m_id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => {
                          fetchFindingsForMushroom(item.m_id);
                          setActiveModal(false);
                        }}>
                          <Text style={styles.mushroomName}>{item.cmname}</Text>
                          <View style={styles.hr} />
                        </TouchableOpacity>
                      )}
                    />
                    <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {activeModal === "findingDetails" && (
                <View style={styles.modalContainer}>

                  <View style={styles.selectFindingmodalContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 16, paddingTop: 10 }}>
                      <Text style={styles.modalTitle}>Select a Finding</Text>
                      <Ionicons name="search" size={30} color="#574E47" />
                    </View>

                    <FlatList
                      data={findingPhotos}
                      keyExtractor={(item) => item.f_Id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleFindingSelection(item)}>
                          <Image
                            source={{ uri: `${API_BASE_URL}/images/${item.imageURL}` }}
                            style={styles.thumbnail}
                          />
                        </TouchableOpacity>
                      )}
                      numColumns={2}
                    />
                    <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </KeyboardAvoidingView>
    </ImageBackground>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: "white",
    minWidth: 60,

  },
  messageText: {
    fontSize: 16,
    flexWrap: "wrap",
    flexShrink: 1,
    maxWidth: 250,
    color: "#fff",
    fontFamily: 'Nunito-medium',
  },
  username: {
    fontFamily: 'Nunito-extrabold',
    fontSize: 15,
    color: "#fff",
  },
  inputContainerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingBottom: 15,

  },
  sendButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#574E47",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#574E47",
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 17,
    backgroundColor: "rgb(234, 230, 229)",
    color: "#574E47",
    fontFamily: 'Nunito-medium',
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: 'Nunito-bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(96, 85, 74, 0.4)",
    width: "100%",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    width: 300,
    borderWidth: 5,
    height: 400,
    borderColor: '#D7C5B7',
  },
  selectFindingmodalContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    width: 300,
    height: 520,
    borderWidth: 5,
    borderColor: '#D7C5B7',
  },
  profileModalContent: {
    backgroundColor: "white",
    padding: 40,
    borderRadius: 10,
    alignItems: "center",
    width: 300,
    borderWidth: 5,
    borderColor: '#D7C5B7',
  },
  findingModalContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 5,
    borderColor: '#D7C5B7',
  },
  profileUsername: {
    fontSize: 20,
    fontFamily: 'Nunito-bold',
    maxWidth: 150,
    color: "#574E47",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  infoTextLabel: {
    fontWeight: "bold",
    color: "#574E47",
    fontSize: 13,
  },
  infoTextValue: {
    fontSize: 14,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "rgb(187, 169, 156)",
    marginVertical: 10,
    padding: 0,
  },
  mushroomList: {
    backgroundColor: '#fff',
    borderColor: '#574E47',
    borderWidth: 1,
    borderRadius: 10,
    maxHeight: 150,
    marginVertical: 10,
  },
  mushroomItem: {
    padding: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  mushroomName: {
    fontFamily: 'Nunito-Bold',
    color: '#574E47',
  },
  linkText: {
    color: "white",
    fontFamily: 'Nunito-ExtraBold',
    borderBottomWidth: 1, borderBottomColor: 'white'
  },
  modalTitle: {
    fontSize: 24,
    color: '#574E47',
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
  },
  thumbnail: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D7C5B7',
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 20,
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
  findingPhoto: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
    marginTop: 15,
  },
  messageTextContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  modalRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#D7C5B780',
  },
  modalSubHeader: {
    fontSize: 16,
    color: '#574E47',
    fontFamily: 'Nunito-Bold',
    minWidth: 70,
    marginRight: 30,
  },
});

export default ChatScreen;
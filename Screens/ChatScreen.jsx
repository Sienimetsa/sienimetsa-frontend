
import React, { useEffect, useState, useRef, useContext } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ImageBackground, Modal, Button, Image, TouchableWithoutFeedback } from "react-native";
import { Client } from "@stomp/stompjs";
import profilePictureMap from "../Components/ProfilePictureMap.js";
import { AuthContext } from "../Service/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchCurrentUser, fetchUserProfileByUsername } from "../Components/Fetch.js";
import { API_SOCKET_URL } from "@env";
import { Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ChatScreen = () => {
 
  const { user, setUser } = useContext(AuthContext); // Retrieve user information from AuthContext
  const [messages, setMessages] = useState([]); // Stores chat messages
  const [input, setInput] = useState(""); // Stores input message
  const [username, setUsername] = useState("Anonymous"); // Default username
  const [chatColor, setChatColor] = useState("#000"); // Default text color for messages
  const [modalVisible, setModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState({}); // Store user profile
  const [uniqueMushrooms, setUniqueMushrooms] = useState(0);
  // Refs
  const clientRef = useRef(null); // Ref for WebSocket client
  const flatListRef = useRef(null); // Ref for FlatList to enable auto-scrolling


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
          client.subscribe("/topic/publicChat", (message) => {
            console.log("Received:", message.body);
            const parsedMessage = JSON.parse(message.body);
            setMessages((prev) => [...prev, parsedMessage]);
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
    // Cleanup function to close WebSocket connection when component unmounts
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        console.log("WebSocket connection closed.");
      }
    };
  }, []);


  // Function to send messages via WebSocket
  const sendMessage = () => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: "/app/send",
        body: JSON.stringify({
          text: input,
          username: username, // Send username
          chatColor: chatColor, // Send chat color
          timestamp: new Date().toISOString(),
        }),
      });
      setInput(""); // Clear input field after sending message
      Keyboard.dismiss(); // Hide the keyboard
    } else {
      console.warn("WebSocket not connected.");
    }
  };

  // Scroll to the latest message when new messages arrive
  useEffect(() => {
    // Scroll to the latest message when messages update
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }

    // Keyboard event listeners
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    // Cleanup function
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [messages]); // Dependency array includes messages



  // function to fetch user profile data
  const fetchUserProfileData = async (clickedUsername) => {
    try {
      const profileData = await fetchUserProfileByUsername(clickedUsername);

      if (profileData && !profileData.error) {
        // Assuming result.uniqueMushrooms is an array of mushroom IDs
        if (profileData.uniqueMushrooms && Array.isArray(profileData.uniqueMushrooms)) {
          // Use a Set to get unique mushrooms from the array
          const uniqueMushroomsSet = new Set(profileData.uniqueMushrooms);
          setUniqueMushrooms(uniqueMushroomsSet.size);  // Set size gives the number of unique mushrooms
        } else {
          setUniqueMushrooms(0);  // If no mushrooms or error, set to 0
        }

        setUserProfile(profileData);
        setModalVisible(true); // Show modal with user profile
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
  return (

    <ImageBackground
      source={require('../assets/Backgrounds/sieni-bg.jpg')}
      style={styles.container}
      resizeMode="cover"
    >

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 70} // Adjust offset
      >
        {/* Profile Modal */}
        <Modal
          visible={modalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setModalVisible(false)} 
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>

                <View style={styles.modalContent}>
                  <TouchableOpacity style={styles.closeIcon} onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="black" />
                  </TouchableOpacity>


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

                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>



        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            initialNumToRender={20} 
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })} // Auto-scroll on size change
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })} // Scroll when FlatList loads
            keyboardShouldPersistTaps="handled" // Dismiss keyboard when tapping outside input
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
                    <Text style={{ fontWeight: "bold", color: "white" }}>{item.username}</Text>
                  </TouchableOpacity>

                  <Text style={styles.messageText} numberOfLines={10} adjustsFontSizeToFit>{item.text}</Text>
                </View>
              );
            }}
          />
        </View>

        {/* Input Box */}
        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message"
            style={styles.input}
            onFocus={() => flatListRef.current?.scrollToEnd({ animated: true })} // Scroll to bottom on focus
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>


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
    marginBottom: 5,
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: 15,
    shadowColor: "#967e45",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    overflow: "hidden",
    minWidth: 60,
  },
  messageText: {
    fontSize: 17,
    flexWrap: "wrap",
    flexShrink: 1,
    maxWidth: 250,
    color: "#fff",
  },
  username: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 17,
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#574E47",
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 17,
    marginRight: 10,
    backgroundColor: "rgb(234, 230, 229)",
    marginBottom: 15,
    color: "#574E47",
  },
  sendButton: {
    backgroundColor: "#574E47",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: 300,
  },
  profileUsername: {
    fontSize: 20,
    fontWeight: "bold",
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
  closeIcon: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10, 
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "rgb(117, 102, 82)",
    marginVertical: 10,
    padding: 0,
  },

});

export default ChatScreen;


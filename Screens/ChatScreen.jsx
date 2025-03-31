import React, { useEffect, useState, useRef, useContext } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform,ImageBackground } from "react-native";
import { Client } from "@stomp/stompjs";
import { AuthContext } from "../Service/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchCurrentUser } from "../Components/Fetch.js";
import { API_SOCKET_URL } from "@env";
import { Keyboard } from "react-native";

const ChatScreen = () => {
  // Retrieve user information from AuthContext
  const { user, setUser } = useContext(AuthContext);

  // State variables
  const [messages, setMessages] = useState([]); // Stores chat messages
  const [input, setInput] = useState(""); // Stores input message
  const [username, setUsername] = useState("Anonymous"); // Default username
  const [chatColor, setChatColor] = useState("#000"); // Default text color for messages

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

    <View style={{ flex: 1 }}>  
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        initialNumToRender={20} // Ensures some messages load first
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
              <Text style={styles.username}>{item.username || "Anonymous"}:</Text>
              <Text style={styles.messageText}>{item.text}</Text>
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
    padding: 10,
  },
  messageContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 12,
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
    fontSize: 14,
    flexWrap: "wrap",
    flexShrink: 1,
    width: "100%",
    color: "#fff",
  },
  username: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 15,
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
    backgroundColor: "rgb(239, 234, 228)",
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
});

export default ChatScreen;

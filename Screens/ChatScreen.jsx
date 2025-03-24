import React, { useEffect, useState, useRef, useContext } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Client } from "@stomp/stompjs";
import { AuthContext } from "../Service/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchCurrentUser } from "../Components/Fetch.js";
import { API_SOCKET_URL } from "@env";

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
    } else {
      console.warn("WebSocket not connected.");
    }
  };

  // Scroll to the latest message when new messages arrive
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : null}>
      <FlatList
        ref={flatListRef} // Assign FlatList reference for auto-scrolling
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          const messageColor = item.chatColor || "#000"; // Use chatColor if available, else default to black
          const isOwnMessage = item.username === username; // Check if the message belongs to the current user
          const messageLength = item.text.length;
          const usernameLength = item.username ? item.username.length : 0;

          // Dynamically set the width of the message bubble based on text length
          let messageWidth = 'auto'; // Default width

          if (messageLength < 6) {
            messageWidth = '45%';
          } else if (messageLength < 11) {
            messageWidth = '50%';
          }
          else {
            messageWidth = '60%';
          }

          // Dynamically set the width of the username based on the username length
          let usernameWidth = 'auto';

          if (usernameLength < 6) {
            usernameWidth = '50%';
          } else if (usernameLength < 9) {
            usernameWidth = '60%';
          } else {
            usernameWidth = '80%';
          }


          return (
            <View
              style={[
                styles.messageContainer,
                {
                  backgroundColor: messageColor, // Chat bubble color
                  alignSelf: isOwnMessage ? "flex-end" : "flex-start", // Align message based on sender
                  width: messageWidth, // Set width dynamically
                },
              ]}
            >
              {/* Display username above the message */}
              <Text style={[styles.username, { color: "#fff", width: usernameWidth }]}>
                {item.username || "Anonymous"}:
              </Text>
              {/* Display chat message text */}
              <Text style={[styles.messageText, { color: "#fff" }]}>{item.text}</Text>
            </View>
          );
        }}
      />

      {/* Input box and send button */}
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2e4c4",
    padding: 10,
  },
  messageContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 12,
    padding: 10,
    marginTop: 5,
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
  },
  username: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#967e45",
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 17,
    marginRight: 10,
    backgroundColor: "#f0e7d1",
    marginBottom: 15,
  },
  sendButton: {
    backgroundColor: "#967e45",
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

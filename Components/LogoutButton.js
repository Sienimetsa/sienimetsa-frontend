import React, { useContext } from "react";
import { Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../Service/AuthContext"; // Adjust the import path if necessary

const LogoutButton = ({ navigation }) => {
  const { logout } = useContext(AuthContext);

  return (
    <TouchableOpacity
      onPress={() => {
        logout(); // Clear user session
        navigation.replace("Login"); // Redirect to Login screen
      }}
      style={{
        marginRight: 15,
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        borderRadius: 20,
      }}
    >
      <Text style={{ color: "#ffffff", fontSize: 17 }}>Logout</Text>
      <Ionicons name="log-out-outline" size={24} color="#ffffff" />
    </TouchableOpacity>
  );
};

export default LogoutButton;

import React, { useContext } from "react";
import { View, Text, StyleSheet,Button } from "react-native";
import { AuthContext } from "../Service/AuthContext";
import { useNavigation } from '@react-navigation/native'; 
export default function HomeScreen() {
  const { user, loading } = useContext(AuthContext);
  const navigation = useNavigation();
  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {user ? user.email : "Guest"}!</Text>
      <Button
        title="Go to Settings"
        onPress={() => navigation.navigate('Settings')}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

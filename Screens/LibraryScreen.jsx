import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "@env";

export default function LibraryScreen() {
  const [data, setData] = useState([])

  // Fetch mushrooms data function
  const fetchMushroomsData = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");

      if (!token) {
        console.error("No JWT token found.");
        navigation.navigate("Login");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/mushrooms`, {
        headers: { Authorization : `Bearer ${token}` },
      });

      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }

      const json = response.data;
      setData(json._embedded.mushrooms);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMushroomsData();
  }, []);

  // Render mushroom data
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>Name: {item.mname}</Text>
      <Text style={styles.itemText}>Toxicity Level: {item.toxicity_level}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.m_Id.toString()}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  item: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
    marginBottom: 5,
  },
})
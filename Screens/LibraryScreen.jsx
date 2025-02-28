import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { fetchMushroomsData } from '../Components/Fetch';

export default function LibraryScreen() {
  const [data, setData] = useState([])

  // Call fetch mushrooms data function
  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchMushroomsData();
      if (!result.error) {
        setData(result);
      } else {
        if (result.error === "No JWT token found.") {
          navigation.navigate("Login");
        }
      }
    };

    fetchData();
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
        keyExtractor={item => item.m_id.toString()}
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
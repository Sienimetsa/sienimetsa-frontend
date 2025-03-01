import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { fetchMushroomsData, fetchUserFindings } from '../Components/Fetch';

export default function LibraryScreen() {
  const [mushroomData, setMushroomData] = useState([]);
  const [findingsData, setFindingsData] = useState([]);
  const [findingIds, setFindingIds] = useState([]);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  // Call fetch mushrooms data function
  useEffect(() => {
    const fetchAllMushroomData = async () => {
      const result = await fetchMushroomsData();
      if (!result.error) {
        setMushroomData(result);
      } else {
        if (result.error === "No JWT token found.") {
          navigation.navigate("Login");
        }
      }
    };

    fetchAllMushroomData();
  }, []);


  useEffect(() => {
    const fetchFindingsData = async () => {
      const result = await fetchUserFindings();
      if (!result.error) {
        setFindingsData(result);
        setInitialFetchDone(true);
        const findingIds = result.map(finding => finding.mushroom.m_id);
        setFindingIds(findingIds);
      } else {
        if (result.error === "No JWT token found.") {
          navigation.navigate("Login");
        }
      }
    };

    fetchFindingsData();
  }, [mushroomData]);


  // Render mushroom data
  const renderItem = ({ item }) => {
    const foundStatus = findingIds.includes(item.m_id);
    return (
      <View style={foundStatus ? styles.found : styles.item}>
        <Text style={styles.itemText}>Name: {item.mname}</Text>
        <Text style={styles.itemText}>Toxicity Level: {item.toxicity_level}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={mushroomData}
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
  found: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#b3dbbf',
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
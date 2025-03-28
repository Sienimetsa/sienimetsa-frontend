import { Button, FlatList, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { fetchMushroomsData, fetchUserFindings } from '../Components/Fetch';
import { Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import mushroomPictureMap from '../Components/MushroomPictureMap';

export default function LibraryScreen({ navigation }) {
  const [mushroomData, setMushroomData] = useState([]);
  const [findingsData, setFindingsData] = useState([]);
  const [findingIds, setFindingIds] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMushroom, setSelectedMushroom] = useState({ mname: 'Information not available', toxicity_level: 'Information not available', color: 'Information not available', gills: 'Information not available', cap: 'Information not available', taste: 'Information not available' });


  // Call fetchAllMushroomData function
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

  // Call fetchFindingsData function and set findingIds (useFocusEffect to update foundStatus in case of deleted findings)
  useFocusEffect(
    React.useCallback(() => {
      const fetchFindingsData = async () => {
        const result = await fetchUserFindings();
        if (!result.error) {
          setFindingsData(result);
          const findingIds = result.map(finding => finding.mushroom.m_id);
          setFindingIds(findingIds);
        } else {
          if (result.error === "No JWT token found.") {
            navigation.navigate("Login");
          }
        }
      };

      fetchFindingsData();
    }, [])
  );

  // Open mushroom detail modal and pass item data
  const openMushroomDetailModal = (item) => {
    setSelectedMushroom(item);
    console.log("Selected mushroom:", item.mname);
    console.log("Image available:", mushroomPictureMap[item.mname] ? "Yes" : "No");
    setModalVisible(true)
  };

  // Render list item and set style based on if mushroom is found or not
  const renderItem = ({ item }) => {
    const foundStatus = findingIds.includes(item.m_id);
    return (
      <TouchableOpacity style={foundStatus ? styles.found : styles.item} onPress={() => openMushroomDetailModal(item)}>
        <Text style={styles.itemText}>Name: {item.mname}</Text>
        <Text style={styles.itemText}>Toxicity Level: {item.toxicity_level}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>

      {/* MODAL BLOCK */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Image
                  source={
                    mushroomPictureMap[selectedMushroom.mname] || require('../assets/mushroom-photos/mushroom_null.png')
                  }
                  style={styles.modalImage}
                />
                <Text style={styles.modalTitle}>{selectedMushroom.mname}</Text>
                <Text>Toxicity Level: {selectedMushroom.toxicity_level}</Text>
                <Text>Color: {selectedMushroom.color}</Text>
                <Text>Gills: {selectedMushroom.gills}</Text>
                <Text>Cap: {selectedMushroom.cap}</Text>
                <Text>Taste: {selectedMushroom.taste}</Text>

                {findingIds.includes(selectedMushroom.m_id) && (
                  <TouchableOpacity
                    style={styles.findingsButton}
                    onPress={() => {
                      setModalVisible(false);
                      navigation.navigate('FindingsScreen', {
                        mushroomId: selectedMushroom.m_id,
                        mushroomName: selectedMushroom.mname,
                      });
                    }}>
                    <Text style={styles.findingsButtonText}>View Findings →</Text>
                  </TouchableOpacity>
                )}

                <Button title="Close" onPress={() => setModalVisible(false)} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* FLATLIST BLOCK */}
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalImage: {
    width: "50%",
    height: undefined,
    aspectRatio: 1,
    margin: 10,
    resizeMode: "contain",
  },
  findingsButton: {
    margin: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  findingsButtonText: {
    color: '#fff',
  }
});
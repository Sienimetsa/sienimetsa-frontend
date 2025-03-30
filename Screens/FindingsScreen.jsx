import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import { deleteFinding, fetchUserFindings } from '../Components/Fetch';
import { API_BASE_URL } from '@env';

export default function FindingsScreen({ route, navigation }) {
  const { mushroomId, mushroomName } = route.params;
  const [findingsData, setFindingsData] = useState([]);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch findings data for the selected mushroom
  useEffect(() => {
    const fetchFindingsData = async () => {
      const result = await fetchUserFindings();
      console.log("API Response:", result);

      if (!result.error) {
        const filteredFindings = result.filter(
          (finding) => finding?.mushroom?.m_id === mushroomId
        );
        setFindingsData(filteredFindings);
      } else if (result.error === "No JWT token found.") {
        navigation.navigate("Login");
      }
    };

    fetchFindingsData();
  }, [mushroomId, navigation]);

  const openModal = (finding) => {
    setSelectedFinding(finding);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedFinding(null);
    setModalVisible(false);
  };

  // Call deleteFinding and update state
  const handleDeleteFinding = async () => {

    if (!selectedFinding || !selectedFinding.f_Id) {
      console.error("missing id or selectedFinding");
      alert("Error deleting finding. Please try again.");
      return;
    }

    try {
      console.log("Attempting to delete finding with ID:", selectedFinding.f_Id);
      const result = await deleteFinding(selectedFinding.f_Id);

      if (result.success) {
        setFindingsData(findingsData.filter(finding => finding.f_Id !== selectedFinding.f_Id));
        closeModal();
        alert("Finding deleted successfully");
      } else {
        console.error("Failed to delete finding:", result.error);
        alert("Failed to delete finding. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting finding:", error);
      alert("Error occurred while deleting finding.");
    }
  };

  // Render each item with a fixed color block instead of an image
  const renderItem = ({ item }) => {
    if (item.imageURL) {
      const imageUrl = `${API_BASE_URL}/images/${item.imageURL}`;
      console.log("API_BASE_URL:", API_BASE_URL);
      console.log("Full image URL:", imageUrl);
    }

    return (
      <TouchableOpacity style={styles.thumbnailContainer} onPress={() => openModal(item)}>
        <View style={styles.thumbnailWrapper}>
          {item.imageURL ? (
            <Image
              source={{
                uri: `${API_BASE_URL}/images/${item.imageURL}`,
                cache: 'reload'
              }}
              style={styles.thumbnail}
              resizeMode="cover"
              onError={(e) => console.error("Thumbnail error:", e.nativeEvent.error)}
            />
          ) : (
            <Image
              source={require("../assets/mushroom-photos/mushroom_null.png")}
              style={styles.thumbnail}
              resizeMode="cover"
              onError={(e) => console.error("Thumbnail error:", e.nativeEvent.error)}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Back Arrow Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Header Texts */}
      <Text style={styles.header1}>Findings</Text>
      <Text style={styles.header2}>{String(mushroomName) || 'No Mushroom Name Available'}</Text>

      <View style={styles.gridContainer}>
        {/* Grid of found mushrooms */}
        {findingsData.length > 0 ? (
          <FlatList
            data={findingsData}
            renderItem={renderItem}
            keyExtractor={(item, index) => (item?.f_Id ? item.f_Id.toString() : index.toString())}
            numColumns={3} // Grid layout
            columnWrapperStyle={styles.row}
          />
        ) : (
          <Text>No findings available for this mushroom.</Text>
        )}
      </View>

      {/* Modal for showing details of found mushroom */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedFinding && (
              <>
                {selectedFinding.imageURL ? (
                  <>
                    {console.log("Modal image URL:", `${API_BASE_URL}/images/${selectedFinding.imageURL}`)}
                    <Image
                      source={{
                        uri: `${API_BASE_URL}/images/${selectedFinding.imageURL}`,
                        cache: 'reload'
                      }}
                      style={styles.modalImage}
                      resizeMode="cover"
                      onError={(e) => console.error("Image loading error:", e.nativeEvent.error)}
                      onLoadStart={() => console.log("Started loading image")}
                      onLoad={() => console.log("Image loaded successfully!")}
                    />
                  </>
                ) : (
                  <Image
                    source={require("../assets/mushroom-photos/mushroom_null.png")}
                    style={styles.thumbnail}
                    resizeMode="cover"
                    onError={(e) => console.error("Thumbnail error:", e.nativeEvent.error)}
                  />
                )}
                <Text style={styles.modalText}>Found on: {selectedFinding.f_time || 'N/A'}</Text>
                <Text style={styles.modalText}>City: {selectedFinding.city || 'Unknown'}</Text>
                <Text style={styles.modalText}>Notes: {selectedFinding.notes || 'No notes available'}</Text>
              </>
            )}
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteFinding} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  header1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  header2: {
    fontSize: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
  },
  thumbnailContainer: {
    margin: 5,
    alignItems: 'center',
    maxWidth: 100,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
    alignSelf: 'center',
    borderRadius: 10,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#CDBB23',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  gridContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailWrapper: {
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden'
  },
});

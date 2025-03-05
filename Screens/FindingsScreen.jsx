import React, { useEffect, useState } from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Image} from 'react-native';
import { fetchUserFindings } from '../Components/Fetch';

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


    // Template image for mushrooms, needs to be adjusted again when mushroom picture are available
    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.thumbnailContainer} onPress={() => openModal(item)}>
            <Image
                source={{ uri: "https://placehold.co/400" }} // Placeholder image
                style={styles.thumbnail}
            />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Back Arrow Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.header1}>Findings</Text>
            <Text style={styles.header2}> {mushroomName}</Text>

            {/* Grid of found mushroom */}
            {findingsData.length > 0 ? (
                <FlatList
                    data={findingsData}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => (item?.f_id ? item.f_id.toString() : index.toString())}
                    numColumns={3} // Grid layout
                    columnWrapperStyle={styles.row}
                />
            ) : (
                <Text>No findings available for this mushroom.</Text>
            )}

            {/* Modal for showing details of found mushroom */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {selectedFinding && (
                            <>
                                <Image
                                    source={{ uri: "https://placehold.co/400" }}
                                    style={styles.modalImage}
                                />
                                <Text style={styles.modalText}>Found on: {selectedFinding.f_time}</Text>
                                <Text style={styles.modalText}>City: {selectedFinding.city}</Text>
                                <Text style={styles.modalText}>Notes: {selectedFinding.notes}</Text>
                            </>
                        )}
                        <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
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
      justifyContent: 'space-between', 
      alignItems: 'flex-start', 
    },
    thumbnailContainer: {
      margin: 5,
      alignItems: 'center',
      width: 100, 
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
      },
      modalText: {
        fontSize: 16,
        marginBottom: 5,
        textAlign: 'left', 
        width: '100%',  
        alignSelf: 'flex-start', 
      },
      closeButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#d9534f',
        borderRadius: 5,
      },
      closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
      },
  });
  


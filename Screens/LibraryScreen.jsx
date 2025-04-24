import { FlatList, Image, ImageBackground, Keyboard, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { fetchMushroomsData, fetchUserFindings } from '../Service/Fetch';
import { Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import mushroomPictureMap from '../Components/MushroomPictureMap';
import { Ionicons } from "@expo/vector-icons";
import ToxicityIndicator from "../Components/ToxicityIndicator";
import { ActivityIndicator } from 'react-native';

export default function LibraryScreen({ navigation }) {
  const [allMushroomData, setAllMushroomData] = useState([]);
  const [mushroomData, setMushroomData] = useState([]);
  const [findingsData, setFindingsData] = useState([]);
  const [findingIds, setFindingIds] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMushroom, setSelectedMushroom] = useState({ mname: 'Information not available', toxicity_level: 'Information not available', color: 'Information not available', gills: 'Information not available', cap: 'Information not available', taste: 'Information not available' });
  const [searchText, setSearchText] = useState("");
  const [toggleFilter, setToggleFilter] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Call fetchAllMushroomData function
  useEffect(() => {
    const fetchAllMushroomData = async () => {
      const result = await fetchMushroomsData();
      if (!result.error) {
        // Sort the mushroom data alphabetically by common name
        const sortedMushrooms = [...result].sort((a, b) =>
          a.cmname.toLowerCase().localeCompare(b.cmname.toLowerCase())
        );
        setAllMushroomData(sortedMushrooms);
        setMushroomData(sortedMushrooms);
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
    setImageLoading(true);
    setModalVisible(true)
  };

  // Render list item and set style based on if mushroom is found or not
  const renderItem = ({ item }) => {
    const foundStatus = findingIds.includes(item.m_id);
    const findingsCount = getMushroomFindingsCount(item.m_id);
    return (
      <TouchableOpacity style={foundStatus ? styles.found : styles.item} onPress={() => openMushroomDetailModal(item)}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.listItemHeader}>{item.cmname}</Text>
            <Text style={styles.listItemSubHeader}>{item.mname}</Text>
            <View style={styles.listItemToxicityContainer}>
              <Text style={styles.listItemToxicity}>Toxicity Level: </Text>
              <ToxicityIndicator toxicity_level={item.toxicity_level} />
            </View>
          </View>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 50, height: 50 }}>
              <Image
                source={mushroomPictureMap[item.mname] || require('../assets/mushroom-photos/mushroom_null.png')}
                style={{ width: '100%', height: '100%', borderRadius: 5, resizeMode: 'contain', }}
              />
            </View>
            {foundStatus && (
              <Text style={styles.findingCountText}>
                Found: {findingsCount}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  // filter mushroom list based on search text
  const filteredMushroomList = mushroomData.filter(item => {
    const searchLower = searchText.toLowerCase().trim();

    // Special case for toxicity level exact matches
    if (searchLower === "low" || searchLower === "medium" || searchLower === "high") {
      return item.toxicity_level.toLowerCase() === searchLower;
    }

    // Regular search across all fields
    return item.mname.toLowerCase().includes(searchLower) ||
      item.toxicity_level.toLowerCase().includes(searchLower) ||
      item.cmname.toLowerCase().includes(searchLower);
  });

  const toggleFilterFound = () => {
    if (!toggleFilter) {
      setToggleFilter(true);
      const filteredData = allMushroomData.filter(item => findingIds.includes(item.m_id))
        // Sort filtered data alphabetically
        .sort((a, b) => a.cmname.toLowerCase().localeCompare(b.cmname.toLowerCase()));
      setMushroomData(filteredData);
    }
    else {
      setToggleFilter(false);
      setMushroomData([...allMushroomData]);
    }
  }

  const getMushroomFindingsCount = (mushroomId) => {
    return findingsData.filter(finding => finding.mushroom.m_id === mushroomId).length;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../assets/Backgrounds/sieni-bg.jpg')}
        style={styles.container}
        resizeMode="cover"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>

            {/* FILTER BLOCK */}
            <View style={styles.titleContainer}>
              {toggleFilter ?
                <Text style={styles.title}>Found Mushrooms</Text> :
                <Text style={styles.title}>All Mushrooms</Text>
              }
            </View>
            <View style={styles.filterContainer}>

              {/* SEARCH BAR */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Search mushrooms..."
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>

              {/* TOGGLE BUTTON */}
              <View>
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => toggleFilterFound()}>
                  {toggleFilter ?
                    <Ionicons name="list-circle" size={30} color="#574E47" /> :
                    <Ionicons name="list-circle-outline" size={30} color="#574E47" />
                  }
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.introContainerBox}>
              {/* FLATLIST BLOCK */}
              {filteredMushroomList.length > 0 ? (
                <FlatList
                  data={filteredMushroomList}
                  renderItem={renderItem}
                  keyExtractor={item => item.m_id.toString()}
                />
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="leaf-outline" size={50} color="#574E47" style={{ marginBottom: 20 }} />
                  <Text style={styles.emptyStateText}>
                    {toggleFilter ? "No found mushrooms yet" : "No matching mushrooms"}
                  </Text>
                  {toggleFilter && (
                    <Text style={styles.emptyStateSubtext}>
                      Explore and add mushrooms to your collection!
                    </Text>
                  )}
                </View>
              )}

              {/* MODAL BLOCK */}
              <Modal visible={modalVisible} animationType="fade" transparent={true}>
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                  <View style={styles.modalContainer}>
                    <TouchableWithoutFeedback>
                      <View style={styles.modalContent}>
                        <View style={styles.imageContainer}>
                          {imageLoading && (
                            <View style={styles.imageLoadingContainer}>
                              <ActivityIndicator size="large" color="#574E47" />
                            </View>
                          )}
                          <Image
                            source={
                              mushroomPictureMap[selectedMushroom.mname] || require('../assets/mushroom-photos/mushroom_null.png')
                            }
                            style={styles.modalImage}
                            onLoadStart={() => setImageLoading(true)}
                            onLoadEnd={() => setImageLoading(false)}
                          />
                        </View>
                        <Text style={styles.modalTitle}>{selectedMushroom.cmname}</Text>
                        <Text style={styles.modalSubTitle}>{selectedMushroom.mname}</Text>

                        <View style={styles.modalRowContainer}>
                          <Text style={styles.modalSubHeader}>Toxicity Level: </Text>
                          <ToxicityIndicator toxicity_level={selectedMushroom.toxicity_level} />
                        </View>

                        <View style={styles.modalRowContainer}>
                          <Text style={styles.modalSubHeader}>Color: </Text>
                          <Text style={styles.modalText}>{selectedMushroom.color}</Text>
                        </View>

                        <View style={styles.modalRowContainer}>
                          <Text style={styles.modalSubHeader}>Gills: </Text>
                          <Text style={styles.modalText}>{selectedMushroom.gills}</Text>
                        </View>

                        <View style={styles.modalRowContainer}>
                          <Text style={styles.modalSubHeader}>Cap: </Text>
                          <Text style={styles.modalText}>{selectedMushroom.cap}</Text>
                        </View>

                        <View style={styles.modalRowContainer}>
                          <Text style={styles.modalSubHeader}>Taste: </Text>
                          <Text style={styles.modalText}>{selectedMushroom.taste}</Text>
                        </View>

                        {findingIds.includes(selectedMushroom.m_id) && (
                          <TouchableOpacity
                            style={styles.buttonFinding}
                            onPress={() => {
                              setModalVisible(false);
                              navigation.navigate('FindingsScreen', {
                                mushroomId: selectedMushroom.m_id,
                                mushroomName: selectedMushroom.mname,
                                mushroomCommonName: selectedMushroom.cmname,
                              });
                            }}>
                            <Text style={styles.findingsButtonText}>View Findings →</Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                          <Text style={styles.closeButtonText}>
                            Close
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ImageBackground>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  imageContainer: {
    width: "50%",
    height: undefined,
    aspectRatio: 1,
    margin: 10,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  found: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#D7C5B780',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#D7C5B7',
  },
  item: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#D7C5B7',
  },
  itemText: {
    fontFamily: 'Nunito-Medium',
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
    borderRadius: 30,
    width: "85%",
    alignItems: "center",
    borderWidth: 5,
    borderColor: '#D7C5B7',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
    color: '#574E47',
    width: '100%',
  },
  modalSubTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontFamily: 'Nunito-Italic',
    textAlign: 'center',
    color: '#574E47',
    width: '100%',
  },
  modalImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  findingsButtonText: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
  },
  closeButtonText: {
    color: '#574E47',
    fontFamily: 'Nunito-Bold',
  },
  introContainerBox: {
    backgroundColor: "rgba(255, 255, 255, 0.93)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flex: 1,
  },
  filterContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.93)",
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: "rgba(72, 56, 38, 0.57)",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "rgba(232, 230, 228, 0.4)",
    width: '100%',
    textAlign: "center",
    fontFamily: 'Nunito-Medium',
  },
  toggleButton: {
    marginLeft: 5,
  },
  inputContainer: {
    width: '90%',
  },
  titleContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.93)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 15,
    paddingBottom: 5,
    paddingHorizontal: 25,
    alignItems: 'center',
    alignSelf: 'center',
  },
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#574E47',
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#574E47',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Nunito-MediumItalic',
  },
  findingCountText: {
    fontSize: 14,
    color: '#574E47',
    marginTop: 3,
    fontFamily: 'Nunito-Bold',
  },
  title: {
    fontSize: 24,
    color: '#574E47',
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
  },
  listItemHeader: {
    fontSize: 18,
    color: '#574E47',
    fontFamily: 'Nunito-Bold',
  },
  listItemSubHeader: {
    fontSize: 14,
    color: '#574E47',
    fontFamily: 'Nunito-Italic',
  },
  listItemToxicity: {
    fontSize: 15,
    marginRight: 5,
    marginBottom: 1.5,
    color: '#574E47',
    fontFamily: 'Nunito-Medium',
  },
  listItemToxicityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  modalRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#D7C5B780',
  },
  modalSubHeader: {
    fontSize: 16,
    color: '#574E47',
    fontFamily: 'Nunito-Bold',
    minWidth: 70,
    marginRight: 30,
  },
  modalText: {
    fontFamily: 'Nunito-Medium',
  },
  buttonFinding: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 45,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    backgroundColor: "#574E47",
    width: 200,
    alignSelf: "center",
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#D7C5B7",
    width: 200,
    alignSelf: "center",
  },
});
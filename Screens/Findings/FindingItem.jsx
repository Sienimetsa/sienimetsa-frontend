import React, { memo, useState } from 'react';
import { View, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { API_BASE_URL } from '@env';

const FindingItem = memo(({ item, onPress, isTopRow, isBottomRow }) => {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <View style={[
      styles.thumbnailContainer,
      // Check if the item is in the top or bottom row and apply styles for correcty margins
      isTopRow && styles.topRowContainer,
      isBottomRow && styles.bottomRowContainer,
    ]}>
      <TouchableOpacity
        onPress={() => onPress(item)}
        style={styles.thumbnailTouchable}
      >
        <View style={styles.thumbnailWrapper}>
          {/* Display the image if it exists, otherwise show a placeholder */}
          {item.imageURL ? (
            <>
              <Image
                source={{
                  uri: `${API_BASE_URL}/images/${item.imageURL}`
                }}
                style={styles.thumbnail}
                resizeMode="cover"
                onLoadStart={() => setImageLoading(true)}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
              {imageLoading && (
                <View style={styles.imageLoader}>
                  <ActivityIndicator color="#574E47" />
                </View>
              )}
            </>
          ) : (
            <Image
              source={require("../../assets/mushroom-photos/mushroom_null.png")}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  thumbnailContainer: {
    flex: 1,
    maxWidth: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    marginHorizontal: '1.5%',
  },
  topRowContainer: {
    marginTop: 25,
  },
  bottomRowContainer: {
    marginBottom: 25,
  },
  thumbnailWrapper: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D7C5B7',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});

export default FindingItem;

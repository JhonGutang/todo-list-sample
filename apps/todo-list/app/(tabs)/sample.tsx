
import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';

const gengarBg = require('@/assets/themes-bg/gengar-bg.jpg');

const SampleScreen = () => {
  return (
    <ImageBackground
      source={gengarBg}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.text}>This is the Sample tab. Start building here!</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.30)', // Optional: a subtle overlay for readability
  },
  text: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  }
});

export default SampleScreen;

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

export default function CallsScreen({ navigation }) {
  // Calls list screen
  return (
    <View style={styles.container}>
      <Text style={styles.empty}>Call history yahan dikhegi</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1418', justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#8696a0', fontSize: 16 },
});

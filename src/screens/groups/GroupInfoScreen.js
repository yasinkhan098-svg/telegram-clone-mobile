import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GroupInfoScreen({ route }) {
  const { group } = route.params || {};
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{group?.name || 'Group Info'}</Text>
      <Text style={styles.sub}>{group?.members?.length || 0} members</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1418', alignItems: 'center', justifyContent: 'center' },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  sub: { color: '#8696a0', marginTop: 8 },
});

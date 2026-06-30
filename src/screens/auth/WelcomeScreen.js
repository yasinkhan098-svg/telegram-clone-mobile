import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* App Logo */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>💬</Text>
        </View>
        <Text style={styles.appName}>MyChat</Text>
        <Text style={styles.tagline}>Fast. Simple. Secure.</Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.agreeText}>
          "Start Messaging" par tap karke aap hamari{'\n'}
          <Text style={styles.link}>Privacy Policy</Text> aur{' '}
          <Text style={styles.link}>Terms of Service</Text> se agree karte hain.
        </Text>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('Phone')}>
          <Text style={styles.startButtonText}>Start Messaging →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1418', justifyContent: 'space-between', padding: 30 },
  logoContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#00bfa5', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  logoText: { fontSize: 60 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  tagline: { fontSize: 16, color: '#8696a0' },
  bottom: { alignItems: 'center' },
  agreeText: { color: '#8696a0', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  link: { color: '#00bfa5' },
  startButton: {
    backgroundColor: '#00bfa5', paddingVertical: 16,
    paddingHorizontal: 60, borderRadius: 30,
  },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

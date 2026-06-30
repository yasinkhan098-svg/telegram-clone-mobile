import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView
} from 'react-native';
import { authAPI } from '../../services/api';

export default function PhoneScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    const fullPhone = countryCode + phone.replace(/\s/g, '');

    if (phone.length < 10) {
      Alert.alert('Error', 'Sahi phone number dalein');
      return;
    }

    setLoading(true);
    try {
      await authAPI.sendOTP(fullPhone);
      navigation.navigate('OTP', { phone: fullPhone });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'OTP nahi gaya, dobara try karein');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.content}>
        <Text style={styles.title}>Apna Number Dalein</Text>
        <Text style={styles.subtitle}>
          Aapke number par ek OTP bheja jayega
        </Text>

        {/* Phone Input */}
        <View style={styles.phoneRow}>
          <TouchableOpacity style={styles.countryCode}>
            <Text style={styles.countryCodeText}>{countryCode}</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.phoneInput}
            placeholder="Phone Number"
            placeholderTextColor="#8696a0"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
          />
        </View>

        <Text style={styles.hint}>
          Example: +91 98765 43210
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.nextButton, loading && styles.disabled]}
        onPress={handleSendOTP}
        disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.nextText}>OTP Bhejein →</Text>
        }
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1418', padding: 24 },
  content: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  subtitle: { color: '#8696a0', fontSize: 14, marginBottom: 30 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  countryCode: {
    backgroundColor: '#1c2733', padding: 14, borderRadius: 10,
    marginRight: 10, minWidth: 60, alignItems: 'center',
  },
  countryCodeText: { color: '#00bfa5', fontSize: 16, fontWeight: 'bold' },
  phoneInput: {
    flex: 1, backgroundColor: '#1c2733', color: '#fff',
    padding: 14, borderRadius: 10, fontSize: 18, letterSpacing: 2,
  },
  hint: { color: '#8696a0', fontSize: 12 },
  nextButton: {
    backgroundColor: '#00bfa5', padding: 16,
    borderRadius: 12, alignItems: 'center',
  },
  disabled: { opacity: 0.6 },
  nextText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

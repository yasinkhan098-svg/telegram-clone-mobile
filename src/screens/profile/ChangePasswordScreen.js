import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { authAPI } from '../../services/api';

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      return Alert.alert('Error', 'Sabhi fields bharna zaroori hai');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Error', 'Naya password confirm password se match nahi kar raha');
    }
    if (currentPassword === newPassword) {
      return Alert.alert('Error', 'Naya password purane password jaisa nahi ho sakta');
    }

    setLoading(true);
    try {
      const res = await authAPI.changePassword(currentPassword, newPassword);
      Alert.alert('Success', res.data.message || 'Password successfully change ho gaya!');
      navigation.goBack();
    } catch (error) {
      const msg = error.response?.data?.message || 'Password badalne mein error aaya';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Password Badlein</Text>
          <Text style={styles.subtitle}>Apna account surakshit rakhne ke liye password change karein</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Puraana Password</Text>
          <TextInput
            style={styles.input}
            placeholder="apna puraana password daalein"
            placeholderTextColor="#556170"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Naya Password</Text>
          <TextInput
            style={styles.input}
            placeholder="apna naya password daalein"
            placeholderTextColor="#556170"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Naya Password Confirm Karein</Text>
          <TextInput
            style={styles.input}
            placeholder="naya password dobara daalein"
            placeholderTextColor="#556170"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Password Badlein</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1418' },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#8696a0', textAlign: 'center', lineHeight: 20 },
  form: { backgroundColor: '#1c2733', borderRadius: 16, padding: 20, gap: 4 },
  label: { color: '#8696a0', fontSize: 13, marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: '#0d1418', color: '#fff',
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 16, borderWidth: 1, borderColor: '#2a3942',
  },
  button: {
    backgroundColor: '#00bfa5', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

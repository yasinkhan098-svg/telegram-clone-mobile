import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';
import { saveToken } from '../../utils/storage';
import { initSocket } from '../../services/socketService';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      return Alert.alert('Error', 'Username aur password daalein');
    }

    setLoading(true);
    try {
      const res = await authAPI.login(username.trim(), password);
      await saveToken(res.data.token);
      initSocket(res.data.token);
      dispatch(loginSuccess({ token: res.data.token, user: res.data.user }));
    } catch (error) {
      const msg = error.response?.data?.message || 'Login mein error aaya';
      Alert.alert('Login Failed', msg);
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
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>💬</Text>
          </View>
          <Text style={styles.appName}>MyChat</Text>
          <Text style={styles.tagline}>Fast. Simple. Secure.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="apna username daalein"
            placeholderTextColor="#556170"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="password daalein"
            placeholderTextColor="#556170"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login Karein →</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>
              Naya account?{' '}
              <Text style={styles.registerHighlight}>Register Karein</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1418' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#00bfa5', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: { fontSize: 50 },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  tagline: { fontSize: 14, color: '#8696a0' },
  form: { backgroundColor: '#1c2733', borderRadius: 16, padding: 20, gap: 4 },
  label: { color: '#8696a0', fontSize: 13, marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: '#0d1418', color: '#fff',
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 16, borderWidth: 1, borderColor: '#2a3942',
  },
  button: {
    backgroundColor: '#00bfa5', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  registerLink: { alignItems: 'center', marginTop: 16, paddingVertical: 8 },
  registerText: { color: '#8696a0', fontSize: 14 },
  registerHighlight: { color: '#00bfa5', fontWeight: 'bold' },
});

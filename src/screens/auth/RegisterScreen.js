import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';
import { saveToken, saveUser } from '../../utils/storage';
import { initSocket } from '../../services/socketService';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleRegister = async () => {
    if (!name.trim() || !username.trim() || !password.trim()) {
      return Alert.alert('Error', 'Sab fields bharna zaruri hai');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Password match nahi kar raha');
    }
    if (username.length < 3) {
      return Alert.alert('Error', 'Username kam se kam 3 characters ka hona chahiye');
    }

    setLoading(true);
    try {
      const res = await authAPI.register(name.trim(), username.trim(), password);
      await saveToken(res.data.token);
      await saveUser(res.data.user);
      initSocket(res.data.token);
      dispatch(loginSuccess({ token: res.data.token, user: res.data.user }));
    } catch (error) {
      const msg = error.response?.data?.message || 'Register karne mein error aaya';
      Alert.alert('Register Failed', msg);
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Naya Account</Text>
          <Text style={styles.subtitle}>Apni details bharo aur shuru karo</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Poora Naam</Text>
          <TextInput
            style={styles.input}
            placeholder="jaise: Yasin Khan"
            placeholderTextColor="#556170"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="jaise: yasin123"
            placeholderTextColor="#556170"
            value={username}
            onChangeText={(t) => setUsername(t.toLowerCase().replace(/\s/g, ''))}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>Sirf letters, numbers aur underscore (_)</Text>

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="apna password daalein"
            placeholderTextColor="#556170"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Password Confirm Karein</Text>
          <TextInput
            style={styles.input}
            placeholder="password dobara likhein"
            placeholderTextColor="#556170"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Account Banao →</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              Pehle se account hai?{' '}
              <Text style={styles.loginHighlight}>Login Karein</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1418' },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 40 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#8696a0' },
  form: { backgroundColor: '#1c2733', borderRadius: 16, padding: 20 },
  label: { color: '#8696a0', fontSize: 13, marginTop: 12, marginBottom: 4 },
  hint: { color: '#556170', fontSize: 11, marginTop: 2 },
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
  loginLink: { alignItems: 'center', marginTop: 16, paddingVertical: 8 },
  loginText: { color: '#8696a0', fontSize: 14 },
  loginHighlight: { color: '#00bfa5', fontWeight: 'bold' },
});

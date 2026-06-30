import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, Image, ScrollView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setLocked, logout } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';
import { clearAll } from '../../utils/storage';
import { disconnectSocket } from '../../services/socketService';

export default function LockScreen() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleUnlock = async () => {
    if (!password.trim()) {
      return Alert.alert('Error', 'Password daalna zaroori hai');
    }

    setLoading(true);
    try {
      // Validate password with login API
      await authAPI.login(user.username, password);
      // Unlock app if credentials match
      dispatch(setLocked(false));
    } catch (error) {
      const msg = error.response?.data?.message || 'Galat password, dobara koshish karein';
      Alert.alert('Unlock Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Kya aap logout karke doosre account se login karna chahte hain?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAll();
              disconnectSocket();
              dispatch(logout());
            } catch (e) {
              console.log('Logout clear error:', e);
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* User Profile Info */}
        <View style={styles.profileContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarDefault}>
              <Text style={styles.avatarLetter}>
                {user?.name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.usernameText}>@{user?.username}</Text>
        </View>

        {/* Lock Info */}
        <Text style={styles.infoText}>App locked hai. Kholne ke liye password daalein.</Text>

        {/* Password Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="apna password daalein"
            placeholderTextColor="#556170"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoFocus
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleUnlock}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Unlock Karein</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Doosra Account Use Karein (Logout)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1418' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  profileContainer: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  avatarDefault: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#00bfa5', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLetter: { color: '#fff', fontSize: 44, fontWeight: 'bold' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  usernameText: { fontSize: 15, color: '#8696a0' },
  infoText: { color: '#8696a0', textAlign: 'center', fontSize: 14, marginBottom: 20 },
  form: { backgroundColor: '#1c2733', borderRadius: 16, padding: 20, gap: 4 },
  label: { color: '#8696a0', fontSize: 13, marginTop: 8, marginBottom: 4 },
  input: {
    backgroundColor: '#0d1418', color: '#fff',
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 16, borderWidth: 1, borderColor: '#2a3942',
  },
  button: {
    backgroundColor: '#00bfa5', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logoutBtn: { alignItems: 'center', marginTop: 20, paddingVertical: 8 },
  logoutText: { color: '#ff5252', fontSize: 14, fontWeight: '500' },
});

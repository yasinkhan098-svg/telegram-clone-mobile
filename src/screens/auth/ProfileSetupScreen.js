import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator, Alert
} from 'react-native';
import { useDispatch } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import { authAPI, mediaAPI } from '../../services/api';
import { loginSuccess } from '../../store/slices/authSlice';
import { saveToken, saveUser } from '../../utils/storage';
import { initSocket } from '../../services/socketService';

export default function ProfileSetupScreen({ route }) {
  const { phone, token } = route.params;
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const pickPhoto = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (!result.didCancel && result.assets?.[0]) {
      setAvatar(result.assets[0]);
    }
  };

  const handleDone = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Apna naam dalein');
      return;
    }

    setLoading(true);
    try {
      // Token pehle save karo
      await saveToken(token);

      // Avatar upload karo (agar select kiya)
      let avatarUrl = null;
      if (avatar) {
        const formData = new FormData();
        formData.append('avatar', {
          uri: avatar.uri,
          type: avatar.type,
          name: avatar.fileName || 'avatar.jpg',
        });
        const uploadRes = await mediaAPI.uploadAvatar(formData, token);
        avatarUrl = uploadRes.data.url;
      }

      // Profile update karo
      const profileRes = await authAPI.updateProfile({ name, avatar: avatarUrl }, token);
      const user = profileRes.data.user;

      await saveUser(user);
      initSocket(token);
      dispatch(loginSuccess({ token, user }));

    } catch (error) {
      Alert.alert('Error', 'Profile save nahi hua');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apna Profile Banayein</Text>
      <Text style={styles.subtitle}>Yeh sirf ek baar karna hai</Text>

      {/* Avatar Picker */}
      <TouchableOpacity style={styles.avatarContainer} onPress={pickPhoto}>
        {avatar ? (
          <Image source={{ uri: avatar.uri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarEmoji}>📷</Text>
            <Text style={styles.avatarHint}>Photo Add Karein</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Aapka Naam"
        placeholderTextColor="#8696a0"
        value={name}
        onChangeText={setName}
        maxLength={64}
      />

      <Text style={styles.charCount}>{name.length}/64</Text>

      <TouchableOpacity
        style={[styles.doneButton, loading && styles.disabled]}
        onPress={handleDone}
        disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.doneText}>Done! Chats Mein Jayein →</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1418', padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { color: '#8696a0', marginBottom: 30 },
  avatarContainer: { marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#1c2733', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#00bfa5', borderStyle: 'dashed',
  },
  avatarEmoji: { fontSize: 28 },
  avatarHint: { color: '#8696a0', fontSize: 10, marginTop: 4 },
  input: {
    width: '100%', backgroundColor: '#1c2733', color: '#fff',
    padding: 14, borderRadius: 10, fontSize: 18,
    marginBottom: 4, textAlign: 'center',
  },
  charCount: { color: '#8696a0', alignSelf: 'flex-end', marginBottom: 30 },
  doneButton: { backgroundColor: '#00bfa5', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 12 },
  disabled: { opacity: 0.6 },
  doneText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

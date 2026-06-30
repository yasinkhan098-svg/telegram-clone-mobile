// =====================================================
// EditProfileScreen.js
// =====================================================
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { authAPI } from '../../services/api';
import { updateUser } from '../../store/slices/authSlice';

export default function EditProfileScreen({ navigation }) {
  const { user } = useSelector(state => state.auth);
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Naam zaroor daalen'); return; }
    setLoading(true);
    try {
      const res = await authAPI.updateProfile({ name, username, bio });
      dispatch(updateUser(res.data.user));
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Save nahi hua');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.label}>Naam</Text>
      <TextInput style={s.input} value={name} onChangeText={setName} placeholderTextColor="#8696a0" placeholder="Aapka naam" />
      <Text style={s.label}>Username</Text>
      <TextInput style={s.input} value={username} onChangeText={setUsername} placeholderTextColor="#8696a0" placeholder="@username" autoCapitalize="none" />
      <Text style={s.label}>Bio</Text>
      <TextInput style={[s.input, { height: 80 }]} value={bio} onChangeText={setBio} placeholderTextColor="#8696a0" placeholder="Apne baare mein likhein..." multiline />
      <TouchableOpacity style={s.btn} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Save Karein</Text>}
      </TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1418', padding: 20 },
  label: { color: '#00bfa5', fontSize: 12, marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: '#1c2733', color: '#fff', borderRadius: 10, padding: 12, fontSize: 15 },
  btn: { backgroundColor: '#00bfa5', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

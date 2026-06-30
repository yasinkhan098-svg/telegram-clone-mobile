import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Alert, ScrollView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { logout } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';
import { disconnectSocket } from '../../services/socketService';
import { clearAll } from '../../utils/storage';

export default function ProfileScreen({ navigation }) {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert('Logout', 'Kya aap logout karna chahte hain?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          try {
            await authAPI.logout();
          } catch (e) {}
          await clearAll();
          disconnectSocket();
          dispatch(logout());
        }
      }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarDefault]}>
            <Text style={styles.avatarLetter}>{user?.name?.[0]?.toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
      </View>

      {/* Info Cards */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Icon name="info" size={22} color="#00bfa5" />
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>Bio</Text>
            <Text style={styles.rowValue}>{user?.bio || 'Koi bio nahi'}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Icon name="alternate-email" size={22} color="#00bfa5" />
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>Username</Text>
            <Text style={styles.rowValue}>{user?.username ? `@${user.username}` : 'Set nahi kiya'}</Text>
          </View>
        </View>
      </View>

      {/* Edit Button */}
      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate('EditProfile')}>
        <Icon name="edit" size={20} color="#fff" />
        <Text style={styles.editText}>Profile Edit Karein</Text>
      </TouchableOpacity>

      {/* Change Password Button */}
      <TouchableOpacity
        style={styles.changePasswordBtn}
        onPress={() => navigation.navigate('ChangePassword')}>
        <Icon name="lock" size={20} color="#fff" />
        <Text style={styles.changePasswordText}>Password Badlein</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#ff5252" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1418' },
  avatarSection: { alignItems: 'center', paddingVertical: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  avatarDefault: {
    backgroundColor: '#2a3942', alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { color: '#00bfa5', fontSize: 42, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  phone: { color: '#8696a0', marginTop: 4 },
  card: { backgroundColor: '#1c2733', marginHorizontal: 16, borderRadius: 12, padding: 4, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowInfo: { marginLeft: 14 },
  rowLabel: { color: '#00bfa5', fontSize: 12 },
  rowValue: { color: '#fff', fontSize: 15, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#2a3942', marginLeft: 50 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#00bfa5', margin: 16, padding: 14, borderRadius: 12,
  },
  editText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  changePasswordBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2a3942', margin: 16, marginTop: 0, padding: 14, borderRadius: 12,
  },
  changePasswordText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1c2733', margin: 16, marginTop: 0, padding: 14, borderRadius: 12,
  },
  logoutText: { color: '#ff5252', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});

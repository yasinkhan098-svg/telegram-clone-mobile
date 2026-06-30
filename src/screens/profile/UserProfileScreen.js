import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function UserProfileScreen({ route, navigation }) {
  const { user } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.avatarSection}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarDefault]}>
            <Text style={styles.letter}>{user?.name?.[0]?.toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.name}>{user?.name}</Text>
        {user?.username && <Text style={styles.username}>@{user.username}</Text>}
        {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.goBack()}>
          <Icon name="message" size={26} color="#fff" />
          <Text style={styles.actionLabel}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Icon name="call" size={26} color="#fff" />
          <Text style={styles.actionLabel}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Icon name="videocam" size={26} color="#fff" />
          <Text style={styles.actionLabel}>Video</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1418' },
  avatarSection: { alignItems: 'center', paddingVertical: 40 },
  avatar: { width: 110, height: 110, borderRadius: 55, marginBottom: 14 },
  avatarDefault: { backgroundColor: '#2a3942', alignItems: 'center', justifyContent: 'center' },
  letter: { color: '#00bfa5', fontSize: 46, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  username: { color: '#8696a0', marginTop: 4, fontSize: 15 },
  bio: { color: '#ccc', marginTop: 10, textAlign: 'center', paddingHorizontal: 30 },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 30, marginTop: 10 },
  actionBtn: { alignItems: 'center', backgroundColor: '#1c2733', padding: 16, borderRadius: 14, width: 80 },
  actionLabel: { color: '#8696a0', marginTop: 6, fontSize: 12 },
});

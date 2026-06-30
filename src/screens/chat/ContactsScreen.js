import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator
} from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { userAPI, chatAPI } from '../../services/api';
import { addChat } from '../../store/slices/chatSlice';

export default function ContactsScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.search('');
      setResults(res.data.users);
    } catch (e) {
      console.log('Error loading users:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.trim().length === 0) {
      loadAllUsers();
      return;
    }
    if (text.trim().length < 2) return;
    setLoading(true);
    try {
      const res = await userAPI.search(text);
      setResults(res.data.users);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (user) => {
    setCreating(user._id);
    try {
      const res = await chatAPI.createPrivateChat(user._id);
      const chat = res.data.chat;
      dispatch(addChat(chat));
      navigation.replace('Chat', { chat, other: user });
    } catch (e) {
      console.log(e);
    } finally {
      setCreating(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color="#8696a0" />
        <TextInput
          style={styles.input}
          placeholder="Naam ya number se dhundein..."
          placeholderTextColor="#8696a0"
          value={query}
          onChangeText={handleSearch}
          autoFocus
        />
      </View>

      {loading && <ActivityIndicator color="#00bfa5" style={{ marginTop: 20 }} />}

      <FlatList
        data={results}
        keyExtractor={item => item._id}
        ListHeaderComponent={
          query.trim().length === 0 ? (
            <TouchableOpacity
              style={styles.groupBtnList}
              onPress={() => navigation.navigate('GroupCreate')}>
              <View style={styles.groupIconWrapper}>
                <Icon name="group-add" size={22} color="#fff" />
              </View>
              <Text style={styles.groupBtnText}>Naya Group Banayein</Text>
            </TouchableOpacity>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userItem} onPress={() => startChat(item)}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarDefault]}>
                <Text style={styles.avatarLetter}>{item.name[0].toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userUsername}>
                {item.username ? `@${item.username}` : item.phone}
              </Text>
            </View>
            {creating === item._id
              ? <ActivityIndicator color="#00bfa5" />
              : <Icon name="chat" size={22} color="#00bfa5" />
            }
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.length > 1 && !loading ? (
            <Text style={styles.noResult}>Koi nahi mila "{query}" ke liye</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1418' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1c2733', margin: 10, borderRadius: 10, paddingHorizontal: 12,
  },
  input: { flex: 1, color: '#fff', paddingVertical: 12, marginLeft: 8, fontSize: 15 },
  userItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, paddingHorizontal: 16,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  avatarDefault: { backgroundColor: '#2a3942', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#00bfa5', fontSize: 20, fontWeight: 'bold' },
  userInfo: { flex: 1 },
  userName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  userUsername: { color: '#8696a0', fontSize: 13, marginTop: 2 },
  noResult: { color: '#8696a0', textAlign: 'center', marginTop: 40, fontSize: 15 },
  groupBtnList: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#1c2733',
  },
  groupIconWrapper: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#00bfa5', alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  groupBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

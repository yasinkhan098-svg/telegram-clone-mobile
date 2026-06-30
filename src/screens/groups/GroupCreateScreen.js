import React, { useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image
} from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { userAPI, groupAPI } from '../../services/api';
import { addChat } from '../../store/slices/chatSlice';

export default function GroupCreateScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1=select members, 2=group name
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length < 2) { setSearchResults([]); return; }
    const res = await userAPI.search(text);
    setSearchResults(res.data.users);
  };

  const toggleMember = (user) => {
    setSelectedMembers(prev =>
      prev.find(m => m._id === user._id)
        ? prev.filter(m => m._id !== user._id)
        : [...prev, user]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) { Alert.alert('Error', 'Group ka naam daalen'); return; }
    setLoading(true);
    try {
      const res = await groupAPI.create(groupName, '', selectedMembers.map(m => m._id));
      dispatch(addChat(res.data.group.chatId));
      navigation.replace('Chat', {
        chat: res.data.group.chatId,
        other: { name: groupName, _id: null }
      });
    } catch (e) {
      Alert.alert('Error', 'Group nahi bana');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Group Ka Naam Daalen</Text>
        <Text style={styles.sub}>{selectedMembers.length} members selected</Text>
        <TextInput
          style={styles.input}
          placeholder="Group Name"
          placeholderTextColor="#8696a0"
          value={groupName}
          onChangeText={setGroupName}
          autoFocus
        />
        <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.createBtnText}>Group Banayein ✓</Text>}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Members Chunein</Text>
      <View style={styles.searchBar}>
        <Icon name="search" size={18} color="#8696a0" />
        <TextInput
          style={styles.searchInput}
          placeholder="Naam se dhundein..."
          placeholderTextColor="#8696a0"
          value={query}
          onChangeText={handleSearch}
        />
      </View>

      {/* Selected Members chips */}
      {selectedMembers.length > 0 && (
        <View style={styles.chips}>
          {selectedMembers.map(m => (
            <TouchableOpacity key={m._id} style={styles.chip} onPress={() => toggleMember(m)}>
              <Text style={styles.chipText}>{m.name} ✕</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={searchResults}
        keyExtractor={item => item._id}
        renderItem={({ item }) => {
          const selected = selectedMembers.find(m => m._id === item._id);
          return (
            <TouchableOpacity style={styles.userRow} onPress={() => toggleMember(item)}>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarLetter}>{item.name[0]}</Text>
              </View>
              <Text style={styles.userName}>{item.name}</Text>
              {selected && <Icon name="check-circle" size={22} color="#00bfa5" />}
            </TouchableOpacity>
          );
        }}
      />

      {selectedMembers.length > 0 && (
        <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
          <Text style={styles.nextBtnText}>Agla Step →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1418', padding: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  sub: { color: '#8696a0', marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c2733', borderRadius: 10, paddingHorizontal: 10, marginBottom: 10 },
  searchInput: { flex: 1, color: '#fff', padding: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  chip: { backgroundColor: '#00bfa5', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { color: '#fff', fontSize: 13 },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  avatarSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2a3942', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarLetter: { color: '#00bfa5', fontSize: 18, fontWeight: 'bold' },
  userName: { flex: 1, color: '#fff', fontSize: 15 },
  nextBtn: { backgroundColor: '#00bfa5', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  input: { backgroundColor: '#1c2733', color: '#fff', borderRadius: 10, padding: 14, fontSize: 18, textAlign: 'center', marginVertical: 20 },
  createBtn: { backgroundColor: '#00bfa5', padding: 14, borderRadius: 12, alignItems: 'center' },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

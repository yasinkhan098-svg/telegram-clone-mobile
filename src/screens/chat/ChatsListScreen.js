import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, Image, ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChats } from '../../store/slices/chatSlice';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';

const getOtherMember = (chat, currentUserId) => {
  if (!chat) return {};
  if (chat.type === 'group') {
    const g = chat.groupId || chat.group;
    return { name: g?.name, avatar: g?.avatar };
  }
  if (!chat.members || !Array.isArray(chat.members)) return {};
  return chat.members.find(m => m && (m._id || m.id) !== currentUserId) || {};
};

export default function ChatsListScreen({ navigation }) {
  const dispatch = useDispatch();
  const { chats = [], loading } = useSelector(state => state.chats || {});
  const { user } = useSelector(state => state.auth || {});
  const { onlineUsers = {} } = useSelector(state => state.users || {});
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchChats());
  }, []);

  const myId = user?._id || user?.id;

  const filteredChats = (chats || []).filter(chat => {
    const other = getOtherMember(chat, myId);
    const name = other?.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const renderChat = ({ item }) => {
    const other = getOtherMember(item, myId);
    const otherId = other?._id || other?.id;
    const isOnline = otherId ? onlineUsers[otherId] : false;
    const lastMsg = item.lastMessage;
    const unread = typeof item.unreadCount === 'number' 
      ? item.unreadCount 
      : (myId && item.unreadCount ? (item.unreadCount[myId] || 0) : 0);

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('Chat', { chat: item, other })}>

        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {other?.avatar ? (
            <Image source={{ uri: other.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarDefault]}>
              <Text style={styles.avatarLetter}>{other?.name?.[0]?.toUpperCase()}</Text>
            </View>
          )}
          {isOnline && <View style={styles.onlineDot} />}
        </View>

        {/* Chat Info */}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>{other?.name}</Text>
            <Text style={styles.chatTime}>
              {lastMsg ? moment(lastMsg.createdAt).format('HH:mm') : ''}
            </Text>
          </View>
          <View style={styles.chatFooter}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {lastMsg?.isDeletedForEveryone
                ? '🚫 Message delete ho gaya'
                : lastMsg?.type === 'image' ? '📷 Photo'
                : lastMsg?.type === 'video' ? '🎥 Video'
                : lastMsg?.type === 'voice' ? '🎤 Voice message'
                : lastMsg?.text || lastMsg?.content?.text || 'Chat shuru karein'}
            </Text>
            {unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color="#8696a0" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search karein..."
          placeholderTextColor="#8696a0"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator color="#00bfa5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={item => item._id}
          renderItem={renderChat}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Koi chat nahi hai abhi</Text>
              <Text style={styles.emptySubText}>Nayi chat shuru karein ↓</Text>
            </View>
          }
        />
      )}

      {/* New Chat Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Contacts')}>
        <Icon name="chat" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1418' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1c2733', margin: 10, borderRadius: 10, paddingHorizontal: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', paddingVertical: 10, fontSize: 15 },
  chatItem: { flexDirection: 'row', padding: 12, paddingHorizontal: 16 },
  avatarWrapper: { position: 'relative', marginRight: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarDefault: { backgroundColor: '#2a3942', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#00bfa5', fontSize: 22, fontWeight: 'bold' },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#00e676', borderWidth: 2, borderColor: '#0d1418',
  },
  chatInfo: { flex: 1, justifyContent: 'center' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  chatName: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1 },
  chatTime: { color: '#8696a0', fontSize: 12 },
  chatFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMessage: { color: '#8696a0', fontSize: 14, flex: 1 },
  unreadBadge: {
    backgroundColor: '#00bfa5', borderRadius: 10,
    minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  separator: { height: 1, backgroundColor: '#1c2733', marginLeft: 80 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#fff', fontSize: 18, marginBottom: 8 },
  emptySubText: { color: '#8696a0' },
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    backgroundColor: '#00bfa5', width: 58, height: 58,
    borderRadius: 29, alignItems: 'center', justifyContent: 'center',
    elevation: 6,
  },
});

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Image, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, Modal, Animated, Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { fetchMessages, sendMessage as sendMsg } from '../../store/slices/chatSlice';
import { socketSend } from '../../services/socketService';
import { mediaAPI } from '../../services/api';
import MessageBubble from '../../components/chat/MessageBubble';
import moment from 'moment';

const EMPTY_ARRAY = [];
const { width } = Dimensions.get('window');

export default function ChatScreen({ route, navigation }) {
  const { chat, other } = route.params || {};
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const chatId = chat?._id || chat?.id;
  const otherId = other?._id || other?.id;

  const messages = useSelector(
    state => (chatId ? state.chats.messages[chatId] : EMPTY_ARRAY) || EMPTY_ARRAY
  );
  const typing = useSelector(state => (chatId ? state.chats.typing[chatId] : null));
  const onlineUsers = useSelector(state => state.users.onlineUsers);
  const lastSeen = useSelector(state => state.users.lastSeen);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachMenuVisible, setAttachMenuVisible] = useState(false);
  const attachMenuAnim = useRef(new Animated.Value(0)).current;

  const flatListRef = useRef(null);
  const typingTimeout = useRef(null);

  const isOnline = otherId ? onlineUsers[otherId] : false;
  const otherLastSeen = otherId ? lastSeen[otherId] : null;

  useEffect(() => {
    if (!chatId) {
      Alert.alert('Error', 'Chat details not found');
      navigation.goBack();
      return;
    }
    dispatch(fetchMessages({ chatId, page: 1 }));
    socketSend.markRead(chatId, otherId);
    navigation.setOptions({ headerShown: false });
  }, [chatId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  // Attachment menu animation
  const showAttachMenu = () => {
    setAttachMenuVisible(true);
    Animated.spring(attachMenuAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const hideAttachMenu = () => {
    Animated.timing(attachMenuAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setAttachMenuVisible(false));
  };

  const handleTyping = (value) => {
    setText(value);
    socketSend.typingStart(otherId, chatId);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketSend.typingStop(otherId, chatId);
    }, 1500);
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const msgText = text.trim();
    setText('');
    setSending(true);
    socketSend.typingStop(otherId, chatId);

    try {
      const result = await dispatch(sendMsg({
        chatId,
        type: 'text',
        text: msgText,
      })).unwrap();

      // Receiver ko real-time notify karo
      socketSend.sendMessage(chatId, otherId, result);
    } catch (e) {
      Alert.alert('Error', 'Message nahi gaya');
      setText(msgText);
    } finally {
      setSending(false);
    }
  };

  // ─── UPLOAD HELPER ──────────────────────────────────────────────────────────
  const uploadAndSend = async (fileData, msgType) => {
    setUploading(true);
    hideAttachMenu();
    try {
      const formData = new FormData();
      formData.append('file', fileData);

      const uploadRes = await mediaAPI.upload(formData);

      if (!uploadRes.data?.url) {
        throw new Error('Upload URL nahi mili');
      }

      const msg = await dispatch(sendMsg({
        chatId,
        type: msgType || uploadRes.data.type || 'file',
        mediaUrl: uploadRes.data.url,
        fileName: uploadRes.data.name,
        fileSize: uploadRes.data.size,
        mimeType: uploadRes.data.mimeType,
      })).unwrap();

      socketSend.sendMessage(chatId, otherId, msg);
    } catch (e) {
      console.log('Upload error:', e);
      Alert.alert('Error', 'File upload nahi hui: ' + (e.message || ''));
    } finally {
      setUploading(false);
    }
  };

  // ─── GALLERY (Image Picker) ──────────────────────────────────────────────────
  const handleGallery = async () => {
    hideAttachMenu();
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        quality: 0.85,
        selectionLimit: 1,
      });
      if (result.didCancel || !result.assets?.[0]) return;
      const asset = result.assets[0];
      await uploadAndSend(
        { uri: asset.uri, type: asset.type || 'image/jpeg', name: asset.fileName || 'photo.jpg' },
        asset.type?.startsWith('video/') ? 'video' : 'image'
      );
    } catch (e) {
      Alert.alert('Error', 'Gallery se file nahi mili');
    }
  };

  // ─── CAMERA ─────────────────────────────────────────────────────────────────
  const handleCamera = async () => {
    hideAttachMenu();
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.85,
        saveToPhotos: false,
      });
      if (result.didCancel || !result.assets?.[0]) return;
      const asset = result.assets[0];
      await uploadAndSend(
        { uri: asset.uri, type: asset.type || 'image/jpeg', name: asset.fileName || `photo_${Date.now()}.jpg` },
        'image'
      );
    } catch (e) {
      Alert.alert('Error', 'Camera se photo nahi li ja saki');
    }
  };

  // ─── DOCUMENT PICKER ─────────────────────────────────────────────────────────
  const handleDocument = async () => {
    hideAttachMenu();
    try {
      const doc = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      await uploadAndSend(
        { uri: doc.uri, type: doc.type || 'application/octet-stream', name: doc.name || 'document' },
        'file'
      );
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        Alert.alert('Error', 'Document select nahi hua');
      }
    }
  };

  const renderMessage = ({ item, index }) => {
    const isMe =
      item.senderId === user?._id ||
      item.senderId === user?.id ||
      item.senderId?._id === user?._id ||
      item.senderId?._id === user?.id;

    const prevMsg = messages[index - 1];
    const showDate =
      !prevMsg ||
      moment(item.createdAt).format('DD/MM') !== moment(prevMsg.createdAt).format('DD/MM');

    return (
      <>
        {showDate && (
          <View style={styles.dateLabel}>
            <Text style={styles.dateLabelText}>
              {moment(item.createdAt).calendar(null, {
                sameDay: '[Aaj]',
                lastDay: '[Kal]',
                lastWeek: 'dddd',
                sameElse: 'DD/MM/YYYY',
              })}
            </Text>
          </View>
        )}
        <MessageBubble message={item} isMe={isMe} />
      </>
    );
  };

  // ─── ATTACHMENT MENU MODAL ─────────────────────────────────────────────────
  const AttachMenu = () => (
    <Modal
      visible={attachMenuVisible}
      transparent
      animationType="none"
      onRequestClose={hideAttachMenu}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={hideAttachMenu}>
        <Animated.View
          style={[
            styles.attachMenu,
            {
              opacity: attachMenuAnim,
              transform: [
                {
                  translateY: attachMenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}>
          {/* Camera */}
          <TouchableOpacity style={styles.attachItem} onPress={handleCamera}>
            <View style={[styles.attachIcon, { backgroundColor: '#e91e8c' }]}>
              <Icon name="camera-alt" size={26} color="#fff" />
            </View>
            <Text style={styles.attachLabel}>Camera</Text>
          </TouchableOpacity>

          {/* Gallery */}
          <TouchableOpacity style={styles.attachItem} onPress={handleGallery}>
            <View style={[styles.attachIcon, { backgroundColor: '#8e44ad' }]}>
              <Icon name="photo-library" size={26} color="#fff" />
            </View>
            <Text style={styles.attachLabel}>Gallery</Text>
          </TouchableOpacity>

          {/* Document */}
          <TouchableOpacity style={styles.attachItem} onPress={handleDocument}>
            <View style={[styles.attachIcon, { backgroundColor: '#2196f3' }]}>
              <Icon name="insert-drive-file" size={26} color="#fff" />
            </View>
            <Text style={styles.attachLabel}>Document</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      <AttachMenu />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerInfo}
          onPress={() => navigation.navigate('UserProfile', { user: other })}>
          {other?.avatar ? (
            <Image source={{ uri: other.avatar }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, styles.avatarDefault]}>
              <Text style={styles.avatarLetter}>{other?.name?.[0]?.toUpperCase()}</Text>
            </View>
          )}
          <View>
            <Text style={styles.headerName}>{other?.name}</Text>
            <Text style={styles.headerStatus}>
              {typing
                ? '✍️ likh raha hai...'
                : isOnline
                  ? '🟢 Online'
                  : otherLastSeen
                    ? `Last seen ${moment(otherLastSeen).fromNow()}`
                    : ''}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Call Buttons */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              navigation.navigate('ActiveCall', {
                user: other,
                callType: 'voice',
                isOutgoing: true,
              })
            }>
            <Icon name="call" size={22} color="#00bfa5" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              navigation.navigate('ActiveCall', {
                user: other,
                callType: 'video',
                isOutgoing: true,
              })
            }>
            <Icon name="videocam" size={22} color="#00bfa5" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => (item._id || item.id || Math.random().toString())}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              👋 {other?.name} ko pehla message bhejein!
            </Text>
          </View>
        }
      />

      {/* Uploading indicator */}
      {uploading && (
        <View style={styles.uploadingBar}>
          <ActivityIndicator size="small" color="#00bfa5" />
          <Text style={styles.uploadingText}>File upload ho rahi hai...</Text>
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.inputBar}>
        {/* Attachment icon */}
        <TouchableOpacity onPress={showAttachMenu} style={styles.attachBtn}>
          <Icon name="attach-file" size={24} color="#8696a0" />
        </TouchableOpacity>

        {/* Camera icon (quick camera) */}
        <TouchableOpacity onPress={handleCamera} style={styles.attachBtn}>
          <Icon name="camera-alt" size={24} color="#8696a0" />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Message likhein..."
          placeholderTextColor="#8696a0"
          value={text}
          onChangeText={handleTyping}
          multiline
          maxLength={4096}
        />

        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}>
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="send" size={22} color={text.trim() ? '#fff' : '#8696a0'} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1418' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c2733',
    paddingTop: 44,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  backBtn: { padding: 6, marginRight: 4 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  avatarDefault: {
    backgroundColor: '#2a3942',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: '#00bfa5', fontSize: 18, fontWeight: 'bold' },
  headerName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  headerStatus: { color: '#8696a0', fontSize: 12 },
  headerActions: { flexDirection: 'row' },
  actionBtn: { padding: 8 },

  // Messages
  messageList: { padding: 10, paddingBottom: 10 },
  dateLabel: { alignItems: 'center', marginVertical: 10 },
  dateLabelText: {
    backgroundColor: '#1c2733',
    color: '#8696a0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
  },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#8696a0', fontSize: 15 },

  // Uploading bar
  uploadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c2733',
    padding: 10,
    paddingHorizontal: 16,
  },
  uploadingText: { color: '#8696a0', marginLeft: 10 },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1c2733',
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  attachBtn: { padding: 8 },
  textInput: {
    flex: 1,
    backgroundColor: '#2a3942',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 120,
    fontSize: 15,
  },
  sendBtn: {
    backgroundColor: '#00bfa5',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  sendBtnDisabled: { backgroundColor: '#2a3942' },

  // Attachment menu modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    paddingBottom: 80,
    paddingHorizontal: 12,
  },
  attachMenu: {
    backgroundColor: '#1c2733',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  attachItem: { alignItems: 'center', gap: 8 },
  attachIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachLabel: { color: '#8696a0', fontSize: 12, marginTop: 4 },
});

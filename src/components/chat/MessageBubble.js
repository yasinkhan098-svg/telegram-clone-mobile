import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

export default function MessageBubble({ message, isMe }) {
  const {
    content, text, mediaUrl, type,
    status, isEdited, isDeletedForEveryone,
    createdAt, fileName, fileSize, mimeType,
  } = message;

  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const msgText = text || content?.text;
  const msgMediaUrl = mediaUrl || content?.mediaUrl;
  const msgFileName = fileName || content?.fileName;
  const msgFileSize = fileSize || content?.fileSize;
  const msgDuration = message.mediaDuration || content?.mediaDuration;

  // Deleted message
  if (isDeletedForEveryone) {
    return (
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble, styles.deletedBubble]}>
        <Text style={styles.deletedText}>🚫 Message delete ho gaya</Text>
      </View>
    );
  }

  const statusIcon = () => {
    if (!isMe) return null;
    if (status === 'sending') return <Icon name="access-time" size={12} color="#8696a0" />;
    if (status === 'sent') return <Icon name="done" size={12} color="#8696a0" />;
    if (status === 'delivered') return <Icon name="done-all" size={12} color="#8696a0" />;
    if (status === 'read') return <Icon name="done-all" size={12} color="#00bfa5" />;
    return null;
  };

  // File size readable format
  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <View style={[styles.row, isMe ? styles.myRow : styles.theirRow]}>
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>

        {/* Reply preview */}
        {message.replyTo && (
          <View style={styles.replyPreview}>
            <Text style={styles.replyName} numberOfLines={1}>
              {message.replyTo.senderId?.name}
            </Text>
            <Text style={styles.replyText} numberOfLines={1}>
              {message.replyTo.content?.text || message.replyTo.text || 'Media'}
            </Text>
          </View>
        )}

        {/* Image */}
        {type === 'image' && msgMediaUrl && !imgError && (
          <View style={styles.imageContainer}>
            {imgLoading && (
              <View style={styles.imgPlaceholder}>
                <ActivityIndicator color="#00bfa5" />
              </View>
            )}
            <Image
              source={{ uri: msgMediaUrl }}
              style={[styles.imageMsg, imgLoading && styles.imgHidden]}
              resizeMode="cover"
              onLoadStart={() => { setImgLoading(true); setImgError(false); }}
              onLoad={() => setImgLoading(false)}
              onError={() => { setImgLoading(false); setImgError(true); }}
            />
          </View>
        )}

        {/* Image error fallback */}
        {type === 'image' && imgError && (
          <View style={styles.imgErrorBox}>
            <Icon name="broken-image" size={36} color="#8696a0" />
            <Text style={styles.imgErrorText}>Image load nahi hui</Text>
          </View>
        )}

        {/* Video */}
        {type === 'video' && msgMediaUrl && (
          <View style={styles.videoContainer}>
            <View style={styles.videoThumb}>
              <Icon name="play-circle-filled" size={48} color="#00bfa5" />
            </View>
            <Text style={styles.videoLabel}>
              {msgFileName || 'Video'} {msgFileSize ? `· ${formatSize(msgFileSize)}` : ''}
            </Text>
          </View>
        )}

        {/* Document / File */}
        {(type === 'file' || type === 'document') && (
          <View style={styles.docContainer}>
            <View style={styles.docIconBox}>
              <Icon
                name={
                  mimeType?.includes('pdf') ? 'picture-as-pdf'
                    : mimeType?.includes('word') ? 'description'
                    : 'insert-drive-file'
                }
                size={32}
                color="#00bfa5"
              />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docName} numberOfLines={2}>
                {msgFileName || 'Document'}
              </Text>
              {msgFileSize ? (
                <Text style={styles.docSize}>{formatSize(msgFileSize)}</Text>
              ) : null}
            </View>
          </View>
        )}

        {/* Text */}
        {msgText ? (
          <Text style={styles.messageText}>{msgText}</Text>
        ) : null}

        {/* Voice message */}
        {type === 'voice' && (
          <View style={styles.voiceMsg}>
            <Icon name="play-arrow" size={28} color="#00bfa5" />
            <View style={styles.waveform} />
            <Text style={styles.voiceDuration}>
              {msgDuration ? `${msgDuration}s` : '0:00'}
            </Text>
          </View>
        )}

        {/* Footer — time + status */}
        <View style={styles.footer}>
          {isEdited && <Text style={styles.edited}>edited </Text>}
          <Text style={styles.time}>{moment(createdAt).format('HH:mm')}</Text>
          {statusIcon()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginVertical: 2, paddingHorizontal: 8, flexDirection: 'row' },
  myRow: { justifyContent: 'flex-end' },
  theirRow: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '80%',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    paddingBottom: 4,
  },
  myBubble: { backgroundColor: '#005c4b', borderBottomRightRadius: 2 },
  theirBubble: { backgroundColor: '#1c2733', borderBottomLeftRadius: 2 },
  deletedBubble: { opacity: 0.6 },
  deletedText: { color: '#8696a0', fontStyle: 'italic' },

  replyPreview: {
    borderLeftWidth: 3,
    borderLeftColor: '#00bfa5',
    paddingLeft: 8,
    marginBottom: 6,
    backgroundColor: '#00000020',
    borderRadius: 4,
    padding: 4,
  },
  replyName: { color: '#00bfa5', fontSize: 12, fontWeight: 'bold' },
  replyText: { color: '#8696a0', fontSize: 12 },

  // Image
  imageContainer: { marginBottom: 4 },
  imgPlaceholder: {
    width: 220,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#2a3942',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgHidden: { position: 'absolute', opacity: 0 },
  imageMsg: { width: 220, height: 180, borderRadius: 8 },
  imgErrorBox: {
    width: 220,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#2a3942',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  imgErrorText: { color: '#8696a0', fontSize: 12, marginTop: 4 },

  // Video
  videoContainer: { marginBottom: 4 },
  videoThumb: {
    width: 220,
    height: 140,
    borderRadius: 8,
    backgroundColor: '#2a3942',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoLabel: { color: '#8696a0', fontSize: 11, marginTop: 4 },

  // Document
  docContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00000030',
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
    minWidth: 180,
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#2a3942',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  docInfo: { flex: 1 },
  docName: { color: '#fff', fontSize: 13, fontWeight: '500' },
  docSize: { color: '#8696a0', fontSize: 11, marginTop: 2 },

  messageText: { color: '#fff', fontSize: 15, lineHeight: 20 },

  // Voice
  voiceMsg: { flexDirection: 'row', alignItems: 'center', width: 180 },
  waveform: { flex: 1, height: 2, backgroundColor: '#00bfa5', marginHorizontal: 8 },
  voiceDuration: { color: '#8696a0', fontSize: 12 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
    gap: 3,
  },
  edited: { color: '#8696a0', fontSize: 10, fontStyle: 'italic' },
  time: { color: '#8696a0', fontSize: 11 },
});

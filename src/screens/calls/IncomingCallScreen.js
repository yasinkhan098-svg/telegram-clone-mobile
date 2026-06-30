import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Vibration } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { socketSend } from '../../services/socketService';
import { callRejected } from '../../store/slices/callSlice';

export default function IncomingCallScreen({ navigation }) {
  const { incomingCall } = useSelector(state => state.call);
  const dispatch = useDispatch();

  const handleAccept = () => {
    navigation.replace('ActiveCall', {
      user: { _id: incomingCall.callerId, name: incomingCall.callerName, avatar: incomingCall.callerAvatar },
      callType: incomingCall.callType,
      isOutgoing: false,
    });
  };

  const handleReject = () => {
    socketSend.rejectCall(incomingCall.callerId);
    dispatch(callRejected());
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.callType}>{incomingCall?.callType === 'video' ? '📹 Video' : '📞 Voice'} Call Aa Rahi Hai</Text>

      {incomingCall?.callerAvatar ? (
        <Image source={{ uri: incomingCall.callerAvatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarDefault}>
          <Text style={styles.avatarLetter}>{incomingCall?.callerName?.[0]?.toUpperCase()}</Text>
        </View>
      )}

      <Text style={styles.callerName}>{incomingCall?.callerName}</Text>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
          <Icon name="call-end" size={32} color="#fff" />
          <Text style={styles.btnLabel}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
          <Icon name="call" size={32} color="#fff" />
          <Text style={styles.btnLabel}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1418', alignItems: 'center', justifyContent: 'center', gap: 20 },
  callType: { color: '#8696a0', fontSize: 16 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  avatarDefault: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#2a3942', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#00bfa5', fontSize: 52, fontWeight: 'bold' },
  callerName: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  buttons: { flexDirection: 'row', gap: 50, marginTop: 40 },
  rejectBtn: { alignItems: 'center', backgroundColor: '#ff5252', width: 70, height: 70, borderRadius: 35, justifyContent: 'center' },
  acceptBtn: { alignItems: 'center', backgroundColor: '#00e676', width: 70, height: 70, borderRadius: 35, justifyContent: 'center' },
  btnLabel: { color: '#fff', marginTop: 8, fontSize: 13 },
});

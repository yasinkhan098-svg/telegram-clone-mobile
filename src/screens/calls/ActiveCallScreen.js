import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, Alert, Platform, NativeModules
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { socketSend } from '../../services/socketService';
import { callEnded, callAnswered, startOutgoingCall } from '../../store/slices/callSlice';

// ─── WebRTC: Safe import (native module installed nahi ho sakta) ──────────────
let RTCView = null;
let RTCPeerConnection = null;
let RTCSessionDescription = null;
let mediaDevices = null;
let webRTCAvailable = false;

try {
  // Check if native module is compiled into the APK
  if (NativeModules.WebRTCModule) {
    const WebRTC = require('react-native-webrtc');
    RTCView = WebRTC.RTCView;
    RTCPeerConnection = WebRTC.RTCPeerConnection;
    RTCSessionDescription = WebRTC.RTCSessionDescription;
    mediaDevices = WebRTC.mediaDevices;
    webRTCAvailable = true;
    console.log('✅ WebRTC native module is available');
  } else {
    console.log('⚠️ react-native-webrtc native module is NOT compiled in this APK build — using Socket.IO only mode');
  }
} catch (e) {
  console.log('⚠️ react-native-webrtc not available — using Socket.IO only mode');
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function ActiveCallScreen({ route, navigation }) {
  const { user: otherUser, callType, isOutgoing } = route.params || {};
  const { incomingCall } = useSelector(state => state.call);
  const dispatch = useDispatch();

  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [callStatus, setCallStatus] = useState(isOutgoing ? 'Ringing...' : 'Connecting...');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const peerConnection = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);
  const callEndedRef = useRef(false);

  useEffect(() => {
    startCall();

    return () => {
      cleanup();
    };
  }, []);

  // Jab call answer ho (outgoing call ke liye)
  const { callStatus: reduxCallStatus, activeCall } = useSelector(s => s.call);
  useEffect(() => {
    if (reduxCallStatus === 'ongoing') {
      if (webRTCAvailable && activeCall?.answer && peerConnection.current) {
        try {
          const answer = JSON.parse(activeCall.answer);
          peerConnection.current
            .setRemoteDescription(new RTCSessionDescription(answer))
            .then(() => {
              setCallStatus('Connected');
              startTimer();
            })
            .catch(err => console.log('setRemoteDescription error:', err));
        } catch (e) {
          console.log('Answer parse error:', e);
        }
      } else if (!webRTCAvailable) {
        // Socket-only mode: Transition directly to Connected
        setCallStatus('Connected');
        startTimer();
      }
    }
  }, [reduxCallStatus, activeCall]);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
  };

  const startCall = async () => {
    try {
      if (webRTCAvailable) {
        await startWebRTCCall();
      } else {
        // WebRTC nahi hai — simplified Socket.IO mode
        startSocketOnlyCall();
      }
    } catch (err) {
      console.log('Call start error:', err);
      setCallStatus('Call failed');
      setTimeout(() => navigation.goBack(), 2000);
    }
  };

  const startSocketOnlyCall = () => {
    if (isOutgoing) {
      // Receiver ko notify karo
      socketSend.startCall(otherUser?._id || otherUser?.id, callType, null);
      dispatch(startOutgoingCall({
        callId: `call_${Date.now()}`,
        userId: otherUser?._id || otherUser?.id,
      }));
      setCallStatus('Ringing...');

      // 30 second ke baad timeout
      setTimeout(() => {
        if (callEndedRef.current) return;
        setCallStatus('No answer');
        setTimeout(() => {
          if (!callEndedRef.current) handleEndCall();
        }, 2000);
      }, 30000);
    } else {
      // Incoming call accept kiya
      socketSend.answerCall(incomingCall?.callerId, null);
      setCallStatus('Connected');
      startTimer();
    }
  };

  const startWebRTCCall = async () => {
    // Media stream lo
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
    } catch (mediaErr) {
      console.log('Media error:', mediaErr);
      // Media nahi mili — sirf socket mode pe jao
      startSocketOnlyCall();
      return;
    }

    peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

    // Tracks add karo
    localStreamRef.current.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, localStreamRef.current);
    });

    // Remote stream receive karo
    peerConnection.current.ontrack = (event) => {
      if (event.streams?.[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    // ICE candidates bhejo
    peerConnection.current.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socketSend.sendICECandidate(otherUser?._id || otherUser?.id, candidate);
      }
    };

    // ICE candidates receive karo
    socketSend.setICEHandler(async ({ candidate }) => {
      try {
        if (peerConnection.current && candidate) {
          const { RTCIceCandidate } = require('react-native-webrtc');
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (e) {
        console.log('addIceCandidate error:', e);
      }
    });

    peerConnection.current.onconnectionstatechange = () => {
      const state = peerConnection.current?.connectionState;
      console.log('Connection state:', state);
      if (state === 'connected') {
        setCallStatus('Connected');
        startTimer();
      } else if (state === 'failed' || state === 'disconnected') {
        setCallStatus('Connection lost');
      }
    };

    if (isOutgoing) {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socketSend.startCall(
        otherUser?._id || otherUser?.id,
        callType,
        JSON.stringify(offer)
      );
      dispatch(startOutgoingCall({
        callId: `call_${Date.now()}`,
        userId: otherUser?._id || otherUser?.id,
      }));
    } else {
      // Incoming call — set remote offer
      try {
        const offerStr = incomingCall?.offer;
        if (offerStr) {
          const offer = typeof offerStr === 'string' ? JSON.parse(offerStr) : offerStr;
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socketSend.answerCall(incomingCall?.callerId, JSON.stringify(answer));
          setCallStatus('Connected');
          startTimer();
        } else {
          // No offer — simple accept
          socketSend.answerCall(incomingCall?.callerId, null);
          setCallStatus('Connected');
          startTimer();
        }
      } catch (err) {
        console.log('Remote description error:', err);
        socketSend.answerCall(incomingCall?.callerId, null);
        setCallStatus('Connected');
        startTimer();
      }
    }
  };

  const cleanup = () => {
    callEndedRef.current = true;
    clearInterval(timerRef.current);
    socketSend.clearICEHandler();

    // Stream stop karo
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => {
        try { t.stop(); } catch (e) {}
      });
    }
    // PeerConnection close karo
    if (peerConnection.current) {
      try { peerConnection.current.close(); } catch (e) {}
      peerConnection.current = null;
    }
  };

  const handleEndCall = useCallback(() => {
    cleanup();
    socketSend.endCall(otherUser?._id || otherUser?.id);
    dispatch(callEnded());
    navigation.goBack();
  }, [otherUser, navigation]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = muted; // toggle
      });
    }
    setMuted(m => !m);
  };

  const formatDuration = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <View style={styles.container}>

      {/* Remote video (video call ke liye) */}
      {callType === 'video' && remoteStream && RTCView && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteVideo}
          objectFit="cover"
        />
      )}

      {/* Local video preview */}
      {callType === 'video' && localStream && RTCView && (
        <RTCView
          streamURL={localStream.toURL()}
          style={styles.localVideo}
          objectFit="cover"
          zOrder={1}
        />
      )}

      {/* User Info */}
      <View style={styles.userInfo}>
        {otherUser?.avatar ? (
          <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarDefault}>
            <Text style={styles.avatarLetter}>
              {otherUser?.name?.[0]?.toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{otherUser?.name}</Text>
        <Text style={styles.status}>
          {callStatus === 'Connected' ? formatDuration(duration) : callStatus}
        </Text>
        {callType === 'video' && (
          <View style={styles.callTypeBadge}>
            <Icon name="videocam" size={16} color="#00bfa5" />
            <Text style={styles.callTypeText}>Video Call</Text>
          </View>
        )}
        {callType === 'voice' && (
          <View style={styles.callTypeBadge}>
            <Icon name="call" size={16} color="#00bfa5" />
            <Text style={styles.callTypeText}>Voice Call</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={toggleMute}>
          <View style={[styles.controlIconBg, muted && styles.controlIconActive]}>
            <Icon name={muted ? 'mic-off' : 'mic'} size={26} color={muted ? '#ff5252' : '#fff'} />
          </View>
          <Text style={styles.controlLabel}>{muted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
          <Icon name="call-end" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn} onPress={() => setSpeakerOn(s => !s)}>
          <View style={[styles.controlIconBg, speakerOn && styles.controlIconActive]}>
            <Icon
              name={speakerOn ? 'volume-up' : 'volume-down'}
              size={26}
              color={speakerOn ? '#00bfa5' : '#fff'}
            />
          </View>
          <Text style={styles.controlLabel}>Speaker</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1418',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
  },
  // Video streams
  remoteVideo: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#000',
  },
  localVideo: {
    position: 'absolute',
    top: 60, right: 16,
    width: 100, height: 140,
    borderRadius: 12,
    backgroundColor: '#1c2733',
    zIndex: 10,
  },
  // User info
  userInfo: { alignItems: 'center' },
  avatar: { width: 110, height: 110, borderRadius: 55, marginBottom: 16 },
  avatarDefault: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#2a3942',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  avatarLetter: { color: '#00bfa5', fontSize: 48, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  status: { color: '#8696a0', marginTop: 8, fontSize: 16 },
  callTypeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 10, backgroundColor: '#1c2733',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
  },
  callTypeText: { color: '#00bfa5', fontSize: 13 },
  // Controls
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  controlBtn: { alignItems: 'center', gap: 6 },
  controlIconBg: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#1c2733',
    alignItems: 'center', justifyContent: 'center',
  },
  controlIconActive: { backgroundColor: '#2a3942' },
  controlLabel: { color: '#8696a0', fontSize: 12 },
  endCallBtn: {
    backgroundColor: '#ff5252',
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
  },
});

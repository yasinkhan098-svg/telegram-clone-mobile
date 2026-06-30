import { io } from 'socket.io-client';
import { BASE_URL } from './api';
import store from '../store/store';
import {
  receiveMessage, updateMessageStatus, setTyping
} from '../store/slices/chatSlice';
import {
  setUserOnline, setUserOffline
} from '../store/slices/usersSlice';
import {
  incomingCall, callAnswered, callRejected, callEnded
} from '../store/slices/callSlice';

let socket = null;

// Socket connect karo
export const initSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(BASE_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected! ID:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.log('❌ Socket connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  // ─── MESSAGES ──────────────────────────────────────────────────────────────
  // Real-time message receive (dono users ke liye — sender confirmation + receiver)
  socket.on('message:receive', ({ chatId, message }) => {
    const state = store.getState();
    const userId = state.auth.user?._id || state.auth.user?.id;

    // Duplicate check — agar message already Redux mein hai to add mat karo
    const existing = state.chats.messages[chatId];
    const msgId = message._id || message.id;
    if (existing && msgId && existing.some(m => (m._id || m.id) === msgId)) {
      return;
    }

    store.dispatch(receiveMessage({ chatId, message }));
  });

  socket.on('message:delivered', ({ messageId }) => {
    store.dispatch(updateMessageStatus({ messageId, status: 'delivered' }));
  });

  socket.on('message:read_receipt', ({ chatId, readBy }) => {
    store.dispatch(updateMessageStatus({ chatId, readBy, status: 'read' }));
  });

  // ─── TYPING ────────────────────────────────────────────────────────────────
  socket.on('typing:started', ({ userId, chatId, name }) => {
    store.dispatch(setTyping({ userId, chatId, isTyping: true, name }));
  });

  socket.on('typing:stopped', ({ userId, chatId }) => {
    store.dispatch(setTyping({ userId, chatId, isTyping: false }));
  });

  // ─── ONLINE STATUS ─────────────────────────────────────────────────────────
  socket.on('user:online', ({ userId }) => {
    store.dispatch(setUserOnline(userId));
  });

  socket.on('user:offline', ({ userId, lastSeen }) => {
    store.dispatch(setUserOffline({ userId, lastSeen }));
  });

  // ─── CALLS ─────────────────────────────────────────────────────────────────
  socket.on('call:incoming', (data) => {
    console.log('📞 Incoming call from:', data.callerName);
    store.dispatch(incomingCall(data));
  });

  socket.on('call:answered', ({ answer }) => {
    store.dispatch(callAnswered({ answer }));
  });

  socket.on('call:rejected', ({ by }) => {
    store.dispatch(callRejected({ by }));
  });

  socket.on('call:ended', () => {
    store.dispatch(callEnded());
  });

  // ICE Candidate — WebRTC ke liye (store mein dispatch nahi karte, direct handle hoga)
  socket.on('call:ice_candidate', (data) => {
    // ActiveCallScreen mein directly sunna chahiye
    // Isliye event emit karte hain taaki listener pakad sake
    if (socket._iceHandler) {
      socket._iceHandler(data);
    }
  });

  return socket;
};

// Socket actions
export const socketSend = {
  sendMessage: (chatId, receiverId, message) => {
    socket?.emit('message:send', { chatId, receiverId, message });
  },
  markRead: (chatId, senderId) => {
    socket?.emit('message:read', { chatId, senderId });
  },
  typingStart: (receiverId, chatId) => {
    socket?.emit('typing:start', { receiverId, chatId });
  },
  typingStop: (receiverId, chatId) => {
    socket?.emit('typing:stop', { receiverId, chatId });
  },
  joinGroup: (groupId) => {
    socket?.emit('group:join', groupId);
  },
  groupMessage: (groupId, message) => {
    socket?.emit('group:message', { groupId, message });
  },

  // Calls
  startCall: (receiverId, callType, offer) => {
    socket?.emit('call:start', { receiverId, callType, offer });
  },
  answerCall: (callerId, answer) => {
    socket?.emit('call:answer', { callerId, answer });
  },
  rejectCall: (callerId) => {
    socket?.emit('call:reject', { callerId });
  },
  endCall: (receiverId) => {
    socket?.emit('call:end', { receiverId });
  },
  sendICECandidate: (receiverId, candidate) => {
    socket?.emit('call:ice_candidate', { receiverId, candidate });
  },

  // ICE candidate listener register karo (ActiveCallScreen use karega)
  setICEHandler: (handler) => {
    if (socket) socket._iceHandler = handler;
  },
  clearICEHandler: () => {
    if (socket) socket._iceHandler = null;
  },
};

export const getSocket = () => socket;
export const disconnectSocket = () => socket?.disconnect();

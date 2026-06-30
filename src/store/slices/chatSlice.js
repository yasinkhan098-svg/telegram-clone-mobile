import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatAPI, messageAPI } from '../../services/api';

// Chats laao server se
export const fetchChats = createAsyncThunk('chats/fetchChats', async () => {
  const res = await chatAPI.getMyChats();
  return res.data.chats;
});

// Messages laao
export const fetchMessages = createAsyncThunk('chats/fetchMessages', async ({ chatId, page }) => {
  const res = await messageAPI.getMessages(chatId, page);
  return { chatId, messages: res.data.messages };
});

// Message bhejo
export const sendMessage = createAsyncThunk('chats/sendMessage', async (data) => {
  const res = await messageAPI.sendMessage(data);
  return res.data.message;
});

// Message delete karo
export const deleteMessage = createAsyncThunk('chats/deleteMessage', async ({ messageId, chatId, deleteForEveryone }) => {
  await messageAPI.deleteMessage(messageId, deleteForEveryone);
  return { messageId, chatId };
});

const chatSlice = createSlice({
  name: 'chats',
  initialState: {
    chats: [],
    messages: {},      // { chatId: [messages] }
    typing: {},        // { chatId: { userId, name } }
    loading: false,
    currentChatId: null,
  },
  reducers: {
    // Real-time message receive hua
    receiveMessage: (state, action) => {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) state.messages[chatId] = [];
      state.messages[chatId].push(message);

      // ChatList mein bhi update karo
      const chatIndex = state.chats.findIndex(c => c._id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = message;
        state.chats[chatIndex].lastMessageTime = message.createdAt;
        // Upar le aao
        const chat = state.chats.splice(chatIndex, 1)[0];
        state.chats.unshift(chat);
      }
    },
    updateMessageStatus: (state, action) => {
      const { messageId, status, chatId } = action.payload;
      if (chatId && state.messages[chatId]) {
        state.messages[chatId] = state.messages[chatId].map(m =>
          m._id === messageId ? { ...m, status } : m
        );
      }
    },
    setTyping: (state, action) => {
      const { chatId, userId, isTyping, name } = action.payload;
      if (isTyping) {
        state.typing[chatId] = { userId, name };
      } else {
        delete state.typing[chatId];
      }
    },
    setCurrentChat: (state, action) => {
      state.currentChatId = action.payload;
    },
    addChat: (state, action) => {
      const exists = state.chats.find(c => c._id === action.payload._id);
      if (!exists) state.chats.unshift(action.payload);
    },
    deleteMessageLocally: (state, action) => {
      const { chatId, messageId } = action.payload;
      if (state.messages[chatId]) {
        state.messages[chatId] = state.messages[chatId].map(m =>
          (m._id === messageId || m.id === messageId)
            ? { ...m, isDeletedForEveryone: 1, text: '🚫 Message delete ho gaya', mediaUrl: null, type: 'text' }
            : m
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chats = action.payload;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { chatId, messages } = action.payload;
        state.messages[chatId] = messages;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const message = action.payload;
        const chatId = message.chatId;
        if (!state.messages[chatId]) state.messages[chatId] = [];
        state.messages[chatId].push(message);
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const { messageId, chatId } = action.payload;
        if (state.messages[chatId]) {
          state.messages[chatId] = state.messages[chatId].map(m =>
            (m._id === messageId || m.id === messageId)
              ? { ...m, isDeletedForEveryone: 1, text: '🚫 Message delete ho gaya', mediaUrl: null, type: 'text' }
              : m
          );
        }
      });
  },
});

export const {
  receiveMessage, updateMessageStatus, setTyping, setCurrentChat, addChat, deleteMessageLocally
} = chatSlice.actions;
export default chatSlice.reducer;

import axios from 'axios';
import { getToken } from '../utils/storage';

// ⚙️ Deployed Render Server URL
export const BASE_URL = 'https://telegram-clone-backend-ox5s.onrender.com';

const api = axios.create({ baseURL: BASE_URL });

// Har request mein token auto attach karo
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── AUTH ───────────────────────────────────────────────
export const authAPI = {
  register: (name, username, password) =>
    api.post('/api/auth/register', { name, username, password }),

  login: (username, password) =>
    api.post('/api/auth/login', { username, password }),

  updateProfile: (data) => api.put('/api/auth/profile', data),

  logout: () => api.post('/api/auth/logout'),

  changePassword: (currentPassword, newPassword) =>
    api.put('/api/auth/change-password', { currentPassword, newPassword }),
};

// ─── USERS ──────────────────────────────────────────────
export const userAPI = {
  getMe: () => api.get('/api/users/me'),
  search: (query) => api.get(`/api/users/search?query=${query}`),
  getProfile: (userId) => api.get(`/api/users/${userId}`),
};

// ─── CHATS ──────────────────────────────────────────────
export const chatAPI = {
  getMyChats: () => api.get('/api/chats'),
  createPrivateChat: (userId) => api.post('/api/chats/private', { userId }),
};

// ─── MESSAGES ───────────────────────────────────────────
export const messageAPI = {
  getMessages: (chatId, page = 1) =>
    api.get(`/api/messages/${chatId}?page=${page}`),
  sendMessage: (data) => api.post('/api/messages/send', data),
  editMessage: (messageId, text) =>
    api.put(`/api/messages/${messageId}/edit`, { text }),
  deleteMessage: (messageId, deleteForEveryone) =>
    api.delete(`/api/messages/${messageId}`, { data: { deleteForEveryone } }),
};

// ─── GROUPS ─────────────────────────────────────────────
export const groupAPI = {
  create: (name, description, memberIds) =>
    api.post('/api/groups/create', { name, description, memberIds }),
  addMember: (groupId, userId) =>
    api.post(`/api/groups/${groupId}/add-member`, { userId }),
  leave: (groupId) => api.post(`/api/groups/${groupId}/leave`),
  getInfo: (groupId) => api.get(`/api/groups/${groupId}`),
};

// ─── CALLS ──────────────────────────────────────────────
export const callAPI = {
  start: (receiverId, callType, offer) => api.post('/api/calls/start', { receiverId, callType, offer }),
  answer: (callId, answer) => api.put(`/api/calls/${callId}/answer`, { answer }),
  end: (callId) => api.put(`/api/calls/${callId}/end`),
  history: () => api.get('/api/calls/history'),
};

// ─── MEDIA ──────────────────────────────────────────────
export const mediaAPI = {
  upload: (formData) => api.post('/api/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadAvatar: (formData) => api.post('/api/media/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default api;

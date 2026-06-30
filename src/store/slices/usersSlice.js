import { createSlice } from '@reduxjs/toolkit';

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    onlineUsers: {},  // { userId: true/false }
    lastSeen: {},     // { userId: timestamp }
  },
  reducers: {
    setUserOnline: (state, action) => {
      state.onlineUsers[action.payload] = true;
    },
    setUserOffline: (state, action) => {
      const { userId, lastSeen } = action.payload;
      state.onlineUsers[userId] = false;
      state.lastSeen[userId] = lastSeen;
    },
  },
});

export const { setUserOnline, setUserOffline } = usersSlice.actions;
export default usersSlice.reducer;

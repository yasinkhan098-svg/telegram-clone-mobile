import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    loading: false,
    isLocked: false,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isLocked = false;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isLocked = false;
    },
    setLocked: (state, action) => {
      state.isLocked = action.payload;
    },
  },
});

export const { loginSuccess, updateUser, logout, setLocked } = authSlice.actions;
export default authSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const callSlice = createSlice({
  name: 'call',
  initialState: {
    incomingCall: null,  // { callerId, callerName, callerAvatar, callType, offer }
    activeCall: null,    // { callId, userId, userName, callType, startedAt }
    callStatus: null,    // 'ringing' | 'ongoing' | 'ended'
  },
  reducers: {
    incomingCall: (state, action) => {
      state.incomingCall = action.payload;
      state.callStatus = 'ringing';
    },
    callAnswered: (state, action) => {
      state.callStatus = 'ongoing';
      state.activeCall = { ...state.activeCall, answer: action.payload.answer };
      state.incomingCall = null;
    },
    callRejected: (state) => {
      state.incomingCall = null;
      state.activeCall = null;
      state.callStatus = 'ended';
    },
    callEnded: (state) => {
      state.incomingCall = null;
      state.activeCall = null;
      state.callStatus = null;
    },
    startOutgoingCall: (state, action) => {
      state.activeCall = action.payload;
      state.callStatus = 'ringing';
    },
  },
});

export const {
  incomingCall, callAnswered, callRejected, callEnded, startOutgoingCall
} = callSlice.actions;
export default callSlice.reducer;

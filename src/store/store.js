import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import callReducer from './slices/callSlice';
import usersReducer from './slices/usersSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    chats: chatReducer,
    call: callReducer,
    users: usersReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ serializableCheck: false }),
});

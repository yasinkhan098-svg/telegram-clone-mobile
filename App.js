import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useSelector } from 'react-redux';
import { StatusBar } from 'react-native';
import store from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import { initSocket } from './src/services/socketService';
import { getToken } from './src/utils/storage';

// Incoming call watcher — Redux state se call detect karo aur navigate karo
function IncomingCallWatcher({ navigationRef }) {
  const incomingCall = useSelector(state => state.call.incomingCall);
  const callStatus = useSelector(state => state.call.callStatus);
  const token = useSelector(state => state.auth.token);
  const prevStatusRef = useRef(null);

  useEffect(() => {
    const isNewRinging =
      incomingCall &&
      callStatus === 'ringing' &&
      prevStatusRef.current !== 'ringing' &&
      token;

    if (isNewRinging && navigationRef.current?.isReady()) {
      // Calls tab > IncomingCall screen pe navigate karo
      try {
        navigationRef.current.navigate('Calls', {
          screen: 'IncomingCall',
        });
      } catch (e) {
        console.log('Navigate to IncomingCall failed:', e.message);
      }
    }
    prevStatusRef.current = callStatus;
  }, [incomingCall, callStatus, token]);

  return null; // koi UI nahi render karta
}

function AppContent() {
  const navigationRef = useRef(null);

  useEffect(() => {
    // App start hote hi socket connect karo agar token hai
    const initApp = async () => {
      const token = await getToken();
      if (token) initSocket(token);
    };
    initApp();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar barStyle="light-content" backgroundColor="#1c2733" />
      <IncomingCallWatcher navigationRef={navigationRef} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

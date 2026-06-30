import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { useNavigation, useNavigationContainerRef } from '@react-navigation/native';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import LockScreen from '../screens/auth/LockScreen';

const Stack = createStackNavigator();

function AppStackScreens() {
  const { token, isLocked } = useSelector(state => state.auth);

  if (token && isLocked) {
    return <LockScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default function RootNavigator({ navigationRef }) {
  return <AppStackScreens />;
}

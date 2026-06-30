import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ChatsListScreen from '../screens/chat/ChatsListScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ContactsScreen from '../screens/chat/ContactsScreen';
import CallsScreen from '../screens/calls/CallsScreen';
import IncomingCallScreen from '../screens/calls/IncomingCallScreen';
import ActiveCallScreen from '../screens/calls/ActiveCallScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import GroupCreateScreen from '../screens/groups/GroupCreateScreen';
import GroupInfoScreen from '../screens/groups/GroupInfoScreen';
import UserProfileScreen from '../screens/profile/UserProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Chat Stack — ChatsList → ChatScreen → ActiveCall (cross-stack navigate ke liye)
function ChatStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1c2733' },
        headerTintColor: '#fff',
      }}>
      <Stack.Screen name="ChatsList" component={ChatsListScreen} options={{ title: 'Chats' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Contacts" component={ContactsScreen} options={{ title: 'Contacts' }} />
      <Stack.Screen name="GroupCreate" component={GroupCreateScreen} options={{ title: 'New Group' }} />
      <Stack.Screen name="GroupInfo" component={GroupInfoScreen} options={{ title: 'Group Info' }} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Profile' }} />
      {/* ActiveCall ChatScreen se bhi navigate ho sake */}
      <Stack.Screen name="ActiveCall" component={ActiveCallScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// Calls Stack
function CallStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1c2733' },
        headerTintColor: '#fff',
      }}>
      <Stack.Screen name="CallsList" component={CallsScreen} options={{ title: 'Calls' }} />
      <Stack.Screen name="ActiveCall" component={ActiveCallScreen} options={{ headerShown: false }} />
      <Stack.Screen name="IncomingCall" component={IncomingCallScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// Profile Stack
function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1c2733' },
        headerTintColor: '#fff',
      }}>
      <Stack.Screen name="MyProfile" component={ProfileScreen} options={{ title: 'My Profile' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1c2733', borderTopColor: '#2a3942' },
        tabBarActiveTintColor: '#00bfa5',
        tabBarInactiveTintColor: '#8696a0',
        tabBarIcon: ({ color, size }) => {
          const icons = { Chats: 'chat', Calls: 'call', Profile: 'person' };
          return <Icon name={icons[route.name]} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Chats" component={ChatStack} />
      <Tab.Screen name="Calls" component={CallStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const Module = require('module');
const path = require('path');

// Mocks
const mockReact = {
  useState: (initial) => [initial, () => {}],
  useEffect: (fn) => fn(),
  useRef: () => ({ current: null }),
};

const mockReactRedux = {
  useDispatch: () => () => {},
  useSelector: (selector) => {
    // Mock state
    const state = {
      auth: { user: { _id: 'user1' } },
      chats: {
        chats: [
          {
            id: 'chat1',
            type: 'private',
            members: [
              { _id: 'user1', name: 'User 1' },
              { _id: 'user2', name: 'User 2' }
            ],
            lastMessage: null,
            unreadCount: {}
          }
        ],
        loading: false
      },
      users: { onlineUsers: {} }
    };
    return selector(state);
  }
};

const mockReactNative = {
  View: 'View',
  Text: 'Text',
  FlatList: 'FlatList',
  TouchableOpacity: 'TouchableOpacity',
  TextInput: 'TextInput',
  Image: 'Image',
  ActivityIndicator: 'ActivityIndicator',
  StyleSheet: {
    create: (styles) => styles
  }
};

const moment = () => ({
  format: () => '12:00'
});

// Intercept require
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id === 'react') return mockReact;
  if (id === 'react-redux') return mockReactRedux;
  if (id === 'react-native') return mockReactNative;
  if (id.includes('react-native-vector-icons/MaterialIcons')) return () => 'Icon';
  if (id === 'moment') return moment;
  if (id.includes('chatSlice')) return { fetchChats: () => {} };
  return originalRequire.apply(this, arguments);
};

try {
  console.log('Loading ChatsListScreen...');
  const ChatsListScreen = require('./src/screens/chat/ChatsListScreen').default;
  
  console.log('Rendering ChatsListScreen with mocks...');
  const navigation = { navigate: () => {} };
  const result = ChatsListScreen({ navigation });
  
  console.log('ChatsListScreen rendered successfully!');
  console.log('Render output keys:', Object.keys(result));
} catch (e) {
  console.error('Render failed with error:', e);
}

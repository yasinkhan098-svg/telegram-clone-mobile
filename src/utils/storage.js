import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveToken = async (token) => {
  await AsyncStorage.setItem('auth_token', token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem('auth_token');
};

export const removeToken = async () => {
  await AsyncStorage.removeItem('auth_token');
};

export const saveUser = async (user) => {
  await AsyncStorage.setItem('user_data', JSON.stringify(user));
};

export const getUser = async () => {
  const data = await AsyncStorage.getItem('user_data');
  return data ? JSON.parse(data) : null;
};

export const removeUser = async () => {
  await AsyncStorage.removeItem('user_data');
};

export const clearAll = async () => {
  await AsyncStorage.clear();
};

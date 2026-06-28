import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'healthsync.auth_token';

export async function getStoredAuthToken() {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

export async function setStoredAuthToken(token: string) {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

export async function clearStoredAuthToken() {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}

import { Redirect } from 'expo-router';
import { useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

export default function IndexScreen() {
  const auth = useContext(AuthContext);

  // Safety check just in case Context isn't ready
  if (!auth) return null;

  const { user, loading } = auth;

  // 1. While we are checking SecureStore for the token, show a spinner
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0B0F19]">
        <ActivityIndicator size="large" color="#22d3ee" />
      </View>
    );
  }

  // 2. If the user is logged in, send them straight to the chat
  if (user) {
    return <Redirect href="/(chat)" />;
  }

  // 3. If they are NOT logged in, send them to the login screen
  return <Redirect href="/(auth)" />;
}
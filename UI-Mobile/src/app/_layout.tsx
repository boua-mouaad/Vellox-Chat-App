import { Stack } from 'expo-router';

import { AuthProvider } from '../contexts/AuthContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';

//This root layout acts just like a main.tsx file , in the web version.,
//It wraps the whole app so every screen can access user and chat data
export default function RootLayout() {
  return (
    //Wrap everything in the AuthProvider so every screen can access user data.
    <AuthProvider>
      <WebSocketProvider>
        <Stack screenOptions={{headerShown: false}} />
      </WebSocketProvider>
    </AuthProvider>
  )
}
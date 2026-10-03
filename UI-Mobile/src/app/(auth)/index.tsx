import { useContext, useState } from 'react';

import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { router } from 'expo-router';
import { AuthContext } from '../../contexts/AuthContext';

export default function AuthScreen() {
  const auth = useContext(AuthContext);
    if (!auth) {
    return null;
    }
    const {login } = auth;
  
  // Basic login state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async () => {
    if (!identifier || !password) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await login(identifier, password);
      // Once logged in, navigate to the chat dashboard
      router.replace("/(chat)/index");
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 justify-center bg-[#0B0F19] px-6"
    >
      <View className="w-full rounded-2xl border border-slate-700/60 bg-[#131825]/90 p-8 shadow-2xl">
        
        {/* Header */}
        <View className="mb-6 items-center">
          <View className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500">
            <Text className="text-white font-bold text-xl">V</Text>
          </View>
          <Text className="text-2xl font-bold text-slate-50">Welcome back</Text>
          <Text className="mt-1 text-xs text-slate-400">Enter your credentials to access your chats</Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 items-center">
            <Text className="text-sm font-medium text-red-400">{error}</Text>
          </View>
        ) : null}

        {/* Inputs */}
        <View className="space-y-4">
          <View>
            <Text className="mb-1.5 text-xs font-medium text-slate-400">Username or Email</Text>
            <TextInput 
              value={identifier}
              onChangeText={setIdentifier} // React Native uses onChangeText instead of onChange
              placeholder="username or user@example.com"
              placeholderTextColor="#475569" // slate-600
              autoCapitalize="none"
              className="w-full rounded-lg border border-slate-700/50 bg-[#06090F] px-4 py-3 text-sm text-slate-200"
            />
          </View>

          <View>
            <Text className="mb-1.5 text-xs font-medium text-slate-400">Password</Text>
            <TextInput 
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#475569"
              secureTextEntry // This makes the text into dots for passwords
              className="w-full rounded-lg border border-slate-700/50 bg-[#06090F] px-4 py-3 text-sm text-slate-200"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={handleLoginSubmit}
            disabled={isLoading || !identifier || !password}
            className={`mt-4 w-full items-center justify-center rounded-lg bg-cyan-500 py-3 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-sm font-bold text-white">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}  


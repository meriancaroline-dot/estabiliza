import './src/i18n/i18n';
import React, { useEffect } from 'react';
import { View, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AppProviders } from './src/contexts/AppProviders';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingScreen from './src/screens/SplashScreen';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ ...Ionicons.font });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <AppProviders>
        <AppNavigator />
        <StatusBar style="auto" />
      </AppProviders>
    </View>
  );
}
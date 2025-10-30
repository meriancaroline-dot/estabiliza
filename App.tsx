// App.tsx
import 'react-native-reanimated';
import React from 'react';
import { StatusBar } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme as NavDefaultTheme,
  DarkTheme as NavDarkTheme,
  Theme as NavTheme,
} from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from '@/navigation/AppNavigator';
import { UserProvider } from '@/contexts/UserContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { WellnessProvider } from '@/contexts/WellnessContext';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import { useMoodPrompts } from '@/hooks/useMoodPrompts';

function InnerNavigation() {
  const { theme, isDark } = useTheme();
  const base = isDark ? NavDarkTheme : NavDefaultTheme;

  const navTheme: NavTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.secondary,
    },
  };

  useMoodPrompts();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <NavigationContainer theme={navTheme}>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <UserProvider>
            <WellnessProvider>
              <NotificationProvider>
                <InnerNavigation />
              </NotificationProvider>
            </WellnessProvider>
          </UserProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
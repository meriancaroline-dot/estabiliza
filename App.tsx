// App.tsx
// -------------------------------------------------------------
// Ponto de entrada do app Estabiliza
// - ThemeProvider (troca de tema em tempo real)
// - Providers globais (User, Notifications)
// - NavigationContainer único com tema dinâmico
// -------------------------------------------------------------
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
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import { useMoodPrompts } from '@/hooks/useMoodPrompts';

function ThemedNavigation() {
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

  // Agenda as três notificações diárias de humor
  useMoodPrompts();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <NavigationContainer theme={navTheme}>
        {/* ATENÇÃO: AppNavigator NÃO deve criar outro NavigationContainer */}
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
            <NotificationProvider>
              <ThemedNavigation />
            </NotificationProvider>
          </UserProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

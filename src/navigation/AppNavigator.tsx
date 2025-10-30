// src/navigation/AppNavigator.tsx
// -------------------------------------------------------------
// Stack raiz do app (usa o NavigationContainer do App.tsx)
// -------------------------------------------------------------

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import { RootStackParamList } from './types';
import { useTheme } from '@/hooks/useTheme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={BottomTabs}
        options={{ headerShown: false }}
      />
      {/* Adicione aqui futuras telas fora das Tabs */}
    </Stack.Navigator>
  );
}

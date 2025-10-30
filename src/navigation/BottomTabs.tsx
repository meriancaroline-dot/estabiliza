// src/navigation/BottomTabs.tsx
// -------------------------------------------------------------
// Abas inferiores do app Estabiliza
// -------------------------------------------------------------
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { RootTabParamList } from "./types";

// Telas principais
import DashboardScreen from "@/screens/DashboardScreen";
import TasksAndRemindersScreen from "@/screens/TasksAndRemindersScreen";
import HabitsScreen from "@/screens/HabitsScreen";
import NotesScreen from "@/screens/NotesScreen";
import StatsScreen from "@/screens/StatsScreen";
import MoodScreen from "@/screens/MoodScreen";
import ProfessionalsScreen from "@/screens/ProfessionalsScreen";

// Navegação de Perfil (única agora — inclui Configurações)
import ProfileNavigator from "@/navigation/ProfileNavigator";

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function BottomTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home-outline";

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Tarefas":
              iconName = focused ? "list" : "list-outline";
              break;
            case "Habitos":
              iconName = focused ? "repeat" : "repeat-outline";
              break;
            case "Notas":
              iconName = focused ? "document-text" : "document-text-outline";
              break;
            case "Estatisticas":
              iconName = focused ? "bar-chart" : "bar-chart-outline";
              break;
            case "Humor":
              iconName = focused ? "happy" : "happy-outline";
              break;
            case "Professionals":
              iconName = focused ? "people" : "people-outline";
              break;
            case "Perfil":
              iconName = focused ? "person" : "person-outline";
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "Início" }}
      />

      <Tab.Screen
        name="Tarefas"
        component={TasksAndRemindersScreen}
        options={{ title: "Tarefas" }}
      />

      <Tab.Screen
        name="Habitos"
        component={HabitsScreen}
        options={{ title: "Hábitos" }}
      />

      <Tab.Screen
        name="Notas"
        component={NotesScreen}
        options={{ title: "Notas" }}
      />

      <Tab.Screen
        name="Estatisticas"
        component={StatsScreen}
        options={{ title: "Estatísticas" }}
      />

      <Tab.Screen
        name="Humor"
        component={MoodScreen}
        options={{ title: "Humor" }}
      />

      <Tab.Screen
        name="Professionals"
        component={ProfessionalsScreen}
        options={{ title: "Profissionais" }}
      />

      <Tab.Screen
        name="Perfil"
        component={ProfileNavigator}
        options={{ title: "Perfil" }}
      />
    </Tab.Navigator>
  );
}

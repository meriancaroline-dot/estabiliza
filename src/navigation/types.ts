// -------------------------------------------------------------
// Tipagem das rotas do app (Stack + Tabs + Substacks)
// -------------------------------------------------------------
// Obs: use nomes SEM acento aqui para evitar erros de tipo
// -------------------------------------------------------------

// 👇 Abas inferiores
export type RootTabParamList = {
  Dashboard: undefined;       // Tela inicial
  Tarefas: undefined;         // Tarefas + Lembretes unificados
  Habitos: undefined;         // Hábitos
  Notas: undefined;           // Notas pessoais
  Estatisticas: undefined;    // Estatísticas gerais
  Humor: undefined;           // Registro de humor
  Professionals: undefined;   // Profissionais + Espaço de escuta
  Config: undefined;          // Configurações
  Perfil: undefined;          // Perfil do usuário
};

// 👇 Stack principal (AppNavigator)
export type RootStackParamList = {
  Tabs: undefined;

  // Telas extras fora das Tabs
  Details?: { id: string };
  ReminderDetails?: { id: string };
  TaskDetails?: { id: string };
  HabitDetails?: { id: string };
  NoteDetails?: { id: string };

  // Fluxos futuros
  Onboarding?: undefined;
  Login?: undefined;
};

// -------------------------------------------------------------
// 🧭 Stacks secundários
// -------------------------------------------------------------

// ⚙️ Stack de Configurações
export type SettingsStackParamList = {
  SettingsHome: undefined;
  Notifications: undefined;
  Appearance: undefined;
  Privacy: undefined;
};

// 👤 Stack de Perfil
export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  Achievements: undefined; // Conquistas dentro do perfil
};

// -------------------------------------------------------------
// 📲 Tipos utilitários pra navegação
// -------------------------------------------------------------

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

// Tabs
export type RootTabScreenProps<T extends keyof RootTabParamList> =
  BottomTabScreenProps<RootTabParamList, T>;

// Stack principal
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Substacks (Profile / Settings)
export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
  NativeStackScreenProps<ProfileStackParamList, T>;

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
  NativeStackScreenProps<SettingsStackParamList, T>;

// Composto (pra telas dentro de tabs que também navegam entre stacks)
export type CompositeRootScreenProps<
  T extends keyof RootTabParamList
> = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

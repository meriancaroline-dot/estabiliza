// -------------------------------------------------------------
// 📘 Tipos globais do app Estabiliza
// -------------------------------------------------------------

// -------------------------------------------------------------
// 🌙 Tema
// -------------------------------------------------------------
export type ThemeMode = 'light' | 'dark' | 'system';

// -------------------------------------------------------------
// 🔔 Notificações
// -------------------------------------------------------------
export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  date: Date;
  repeat?: 'daily' | 'weekly' | 'monthly' | 'none';
}

// -------------------------------------------------------------
// 🧠 Usuário
// -------------------------------------------------------------
export interface UserPreferences {
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  dailyReminderTime?: string; // HH:mm
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
}

// -------------------------------------------------------------
// 🕰️ Lembretes
// -------------------------------------------------------------
export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO (YYYY-MM-DD)
  time: string; // HH:mm
  repeat?: 'daily' | 'weekly' | 'monthly' | 'none';
  isCompleted?: boolean;
  notificationId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// -------------------------------------------------------------
// 💬 Humor (Mood)
// -------------------------------------------------------------
export interface MoodEntry {
  id: string;
  mood: string; // Ex: "Feliz", "Triste", "Ansioso"
  rating: number; // 1–5
  note?: string;
  date: string; // ISO
  userId?: string;
}

// -------------------------------------------------------------
// 🔁 Hábitos
// -------------------------------------------------------------
export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
  streak: number;
  lastCompleted?: string; // ISO
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

// -------------------------------------------------------------
// 🏆 Conquistas
// -------------------------------------------------------------
export interface Achievement {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO
  unlocked: boolean;
  icon?: string;
  userId?: string;
}

// -------------------------------------------------------------
// ✅ Tarefas
// -------------------------------------------------------------
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string; // ISO
  updatedAt?: string;
  dueDate?: string; // ISO (opcional)
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  userId?: string;
}

// -------------------------------------------------------------
// 📝 Notas
// -------------------------------------------------------------
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  pinned?: boolean;
  userId?: string;
}

// -------------------------------------------------------------
// 📊 Estatísticas (para useStats e dashboard)
// -------------------------------------------------------------
export interface AppStats {
  totalReminders: number;
  completedReminders: number;
  totalHabits: number;
  activeHabits: number;
  totalTasks: number;
  completedTasks: number;
  moodAverage?: number;
  streakLongest?: number;
  generatedAt: string; // ISO
}

// -------------------------------------------------------------
// ⚙️ Configurações do app
// -------------------------------------------------------------
export interface AppSettings {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  dailyReminderTime?: string;
  backupEnabled?: boolean;
  syncEnabled?: boolean;
}

// -------------------------------------------------------------
// 📦 Dados combinados (para exportação, backup, etc.)
// -------------------------------------------------------------
export interface ExportData {
  user?: User | null; // ✅ permite null
  reminders: Reminder[];
  moods: MoodEntry[];
  habits: Habit[];
  achievements: Achievement[];
  tasks: Task[];
  notes: Note[];
  stats?: AppStats;
  settings?: AppSettings;
  exportedAt: string;
}

// -------------------------------------------------------------
// 🧩 Tipo genérico de entidade
// -------------------------------------------------------------
export type AppEntity =
  | User
  | Reminder
  | MoodEntry
  | Habit
  | Achievement
  | Task
  | Note;

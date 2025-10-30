// -------------------------------------------------------------
// src/screens/TasksAndRemindersScreen.tsx
// -------------------------------------------------------------
// Tarefas + Lembretes (corrigido p/ Expo SDK 54 com triggers tipados)
// -------------------------------------------------------------

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from "react-native";
import * as Notifications from "expo-notifications";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@/hooks/useTheme";
import { useTasks } from "@/hooks/useTasks";
import { useReminders } from "@/hooks/useReminders";
import { Task, Reminder } from "@/types/models";

// -------------------------------------------------------------
// ✅ Handler atualizado para SDK 54
// -------------------------------------------------------------
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type SectionItem =
  | ({ kind: "task" } & Task)
  | ({ kind: "reminder" } & Reminder);

type SectionData = {
  title: string;
  kind: "task" | "reminder";
  data: SectionItem[];
};

export default function TasksAndRemindersScreen() {
  const { theme } = useTheme();
  const { tasks, addTask, deleteTask } = useTasks();
  const { reminders, addReminder, updateReminder, deleteReminder } = useReminders();

  const styles = useMemo(() => createStyles(theme), [theme]);

  // ---------------- TAREFAS ----------------
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  // ---------------- LEMBRETES ----------------
  const [remModalVisible, setRemModalVisible] = useState(false);
  const [editingRemId, setEditingRemId] = useState<string | null>(null);
  const [remTitle, setRemTitle] = useState("");
  const [remDescription, setRemDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [remRepeat, setRemRepeat] = useState<Reminder["repeat"]>("none");
  const [notificationId, setNotificationId] = useState<string | null>(null);

  // -----------------------------------------------------------
  // ✅ Trigger compatível com Expo 54
  // -----------------------------------------------------------
  const scheduleNotification = async (
    title: string,
    date: Date,
    repeat: Reminder["repeat"]
  ) => {
    const now = new Date();
    const secondsUntil =
      (date.getTime() - now.getTime()) / 1000 > 0
        ? (date.getTime() - now.getTime()) / 1000
        : 5;

    let trigger: Notifications.NotificationTriggerInput;
    
    if (repeat === "none") {
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntil,
        repeats: false,
      };
    } else {
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        repeats: true,
        hour: date.getHours(),
        minute: date.getMinutes(),
        ...(repeat === "weekly" && { weekday: date.getDay() }),
        ...(repeat === "monthly" && { day: date.getDate() }),
      };
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: { title: "🔔 Lembrete", body: title },
      trigger,
    });

    return id;
  };

  // -----------------------------------------------------------
  // Salvar lembrete
  // -----------------------------------------------------------
  const onSaveReminder = async () => {
    if (!remTitle.trim())
      return Alert.alert("Campo obrigatório", "Título é obrigatório.");

    try {
      await Notifications.requestPermissionsAsync();

      // Cancela notificação antiga se estiver editando
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }

      const notifId = await scheduleNotification(remTitle, selectedDate, remRepeat);

      const data = {
        title: remTitle.trim(),
        description: remDescription.trim() || undefined,
        date: selectedDate.toISOString().split("T")[0],
        time: selectedDate.toTimeString().slice(0, 5),
        repeat: remRepeat,
        notificationId: notifId,
      };

      if (editingRemId) {
        await updateReminder(editingRemId, data);
      } else {
        await addReminder(data);
      }

      setRemModalVisible(false);
      Alert.alert("✅ Lembrete salvo", "Notificação agendada com sucesso!");
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Falha ao salvar lembrete.");
    }
  };

  // -----------------------------------------------------------
  // Excluir lembrete
  // -----------------------------------------------------------
  const onDeleteReminder = (id: string, notifId?: string) => {
    Alert.alert("Excluir", "Deseja realmente excluir este lembrete?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          if (notifId) await Notifications.cancelScheduledNotificationAsync(notifId);
          await deleteReminder(id);
        },
      },
    ]);
  };

  // -----------------------------------------------------------
  // Criar lembrete
  // -----------------------------------------------------------
  const openCreateReminder = () => {
    setEditingRemId(null);
    setRemTitle("");
    setRemDescription("");
    setSelectedDate(new Date());
    setRemRepeat("none");
    setNotificationId(null);
    setRemModalVisible(true);
  };

  // -----------------------------------------------------------
  // Criar tarefa simples
  // -----------------------------------------------------------
  const openCreateTask = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskModalVisible(true);
  };

  const onSaveTask = async () => {
    if (!taskTitle.trim())
      return Alert.alert("Campo obrigatório", "Título é obrigatório.");
    await addTask({
      title: taskTitle.trim(),
      description: taskDescription.trim() || undefined,
    });
    setTaskModalVisible(false);
  };

  // -----------------------------------------------------------
  // Dados da SectionList
  // -----------------------------------------------------------
  const sections: SectionData[] = useMemo(() => {
    const taskItems: SectionItem[] = tasks.map((t) => ({ kind: "task", ...t }));
    const remItems: SectionItem[] = reminders.map((r) => ({
      kind: "reminder",
      ...r,
    }));
    return [
      { title: "Tarefas", kind: "task", data: taskItems },
      { title: "Lembretes", kind: "reminder", data: remItems },
    ];
  }, [tasks, reminders]);

  // -----------------------------------------------------------
  // Render
  // -----------------------------------------------------------
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: theme.colors.text }]}>
          Tarefas & Lembretes
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={openCreateTask}
            style={[styles.headerBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.headerBtnTxt}>+ Tarefa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={openCreateReminder}
            style={[
              styles.headerBtn,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <Text style={[styles.headerBtnTxt, { color: theme.colors.text }]}>
              + Lembrete
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) =>
          item.kind === "task" ? (
            <View style={styles.row}>
              <Text style={{ color: theme.colors.text }}>{item.title}</Text>
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Text style={{ color: theme.colors.danger }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text }}>{item.title}</Text>
                <Text style={{ color: theme.colors.textSecondary }}>
                  {item.date} às {item.time} • {ptRepeat(item.repeat)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  onDeleteReminder(item.id, (item as any).notificationId)
                }
              >
                <Text style={{ color: theme.colors.danger }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />

      {/* Modal Tarefa */}
      <Modal visible={taskModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Nova Tarefa
            </Text>

            <TextInput
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholder="Título"
              placeholderTextColor={theme.colors.textSecondary}
              style={[
                styles.input,
                { color: theme.colors.text, borderColor: theme.colors.border },
              ]}
            />

            <TextInput
              value={taskDescription}
              onChangeText={setTaskDescription}
              placeholder="Descrição (opcional)"
              placeholderTextColor={theme.colors.textSecondary}
              style={[
                styles.input,
                { color: theme.colors.text, borderColor: theme.colors.border },
              ]}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setTaskModalVisible(false)}
                style={[styles.btn, { borderColor: theme.colors.border }]}
              >
                <Text style={{ color: theme.colors.textSecondary }}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onSaveTask}
                style={[styles.btn, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={{ color: "#fff" }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Lembrete */}
      <Modal visible={remModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Novo Lembrete
            </Text>

            <TextInput
              value={remTitle}
              onChangeText={setRemTitle}
              placeholder="Título"
              placeholderTextColor={theme.colors.textSecondary}
              style={[
                styles.input,
                { color: theme.colors.text, borderColor: theme.colors.border },
              ]}
            />

            <TextInput
              value={remDescription}
              onChangeText={setRemDescription}
              placeholder="Descrição (opcional)"
              placeholderTextColor={theme.colors.textSecondary}
              style={[
                styles.input,
                { color: theme.colors.text, borderColor: theme.colors.border },
              ]}
            />

            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={[styles.input, { justifyContent: "center" }]}
            >
              <Text style={{ color: theme.colors.text }}>
                {selectedDate.toLocaleString("pt-BR")}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={selectedDate}
                mode="datetime"
                is24Hour
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(e, date) => {
                  setShowPicker(false);
                  if (date) setSelectedDate(date);
                }}
              />
            )}

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Repetição
            </Text>
            <View style={styles.chipsRow}>
              {(["none", "daily", "weekly", "monthly"] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setRemRepeat(opt)}
                  style={[
                    styles.chip,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor:
                        remRepeat === opt
                          ? theme.colors.primary + "22"
                          : theme.colors.background,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        remRepeat === opt
                          ? theme.colors.primary
                          : theme.colors.textSecondary,
                      fontWeight: remRepeat === opt ? "700" : "400",
                    }}
                  >
                    {ptRepeat(opt)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setRemModalVisible(false)}
                style={[styles.btn, { borderColor: theme.colors.border }]}
              >
                <Text style={{ color: theme.colors.textSecondary }}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onSaveReminder}
                style={[styles.btn, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={{ color: "#fff" }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function ptRepeat(rep: Reminder["repeat"]) {
  switch (rep) {
    case "daily":
      return "Diária";
    case "weekly":
      return "Semanal";
    case "monthly":
      return "Mensal";
    default:
      return "Sem repetição";
  }
}

// -------------------------------------------------------------
// Estilos
// -------------------------------------------------------------
const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: { flex: 1 },
    header: {
      padding: theme.spacing.lg,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    screenTitle: { fontSize: 22, fontWeight: "700" },
    headerActions: { flexDirection: "row", gap: 8 },
    headerBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    headerBtnTxt: { fontWeight: "700" },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: 6,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    modalCard: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderWidth: 1,
      padding: 16,
    },
    modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
    },
    label: { fontSize: 13, marginBottom: 6 },
    chipsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
    btn: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 1,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
    },
  });
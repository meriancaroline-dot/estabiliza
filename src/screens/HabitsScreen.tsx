import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useHabits } from "@/hooks/useHabits";
import { Habit } from "@/types/models";

// ====== INÍCIO DA ADIÇÃO ======
import { useWellness } from "@/contexts/WellnessContext";
// ====== FIM DA ADIÇÃO ======

export default function HabitsScreen() {
  const { theme } = useTheme();
  const { habits, addHabit, updateHabit, deleteHabit, completeHabit, resetStreak } = useHabits();

  // ====== INÍCIO DA ADIÇÃO ======
  const { state, toggleWater, toggleStretch, registerWater, registerStretch } = useWellness();
  // ====== FIM DA ADIÇÃO ======

  const styles = useMemo(() => createStyles(theme), [theme]);

  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<Habit["frequency"]>("daily");

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setFrequency("daily");
  };

  const openCreate = () => {
    resetForm();
    setVisible(true);
  };

  const openEdit = (h: Habit) => {
    setEditingId(h.id);
    setTitle(h.title);
    setDescription(h.description ?? "");
    setFrequency(h.frequency ?? "daily");
    setVisible(true);
  };

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert("Campo obrigatório", "O título do hábito é obrigatório.");
      return;
    }

    try {
      if (editingId) {
        await updateHabit(editingId, {
          title: title.trim(),
          description: description.trim() || undefined,
          frequency,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await addHabit({
          title: title.trim(),
          description: description.trim() || undefined,
          frequency,
        });
      }
      setVisible(false);
      resetForm();
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o hábito.");
    }
  };

  const onComplete = async (h: Habit) => {
    try {
      await completeHabit(h.id);
    } catch {
      Alert.alert("Erro", "Falha ao completar o hábito.");
    }
  };

  const onReset = async (h: Habit) => {
    try {
      await resetStreak(h.id);
    } catch {
      Alert.alert("Erro", "Falha ao resetar a sequência.");
    }
  };

  const onDelete = (id: string) => {
    Alert.alert("Excluir", "Deseja excluir este hábito?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteHabit(id);
          } catch {
            Alert.alert("Erro", "Falha ao excluir o hábito.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Habit }) => {
    const last = item.lastCompleted ? formatDate(item.lastCompleted) : "—";
    return (
      <View style={styles.item}>
        <View style={styles.itemLeft}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {!!item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
          <Text style={styles.itemMeta}>
            Freq.: {ptFrequency(item.frequency ?? "daily")} • Streak:{" "}
            <Text style={styles.bold}>{item.streak ?? 0}</Text> • Último: {last}
          </Text>
        </View>

        <View style={styles.actionsCol}>
          <TouchableOpacity onPress={() => onComplete(item)} style={[styles.actionBtn, styles.primary]}>
            <Text style={[styles.actionTxt, styles.actionTxtOnPrimary]}>Concluir</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onReset(item)} style={[styles.actionBtn, styles.neutral]}>
            <Text style={styles.actionTxt}>Resetar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openEdit(item)} style={[styles.actionBtn, styles.outline]}>
            <Text style={styles.actionTxt}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item.id)} style={[styles.actionBtn, styles.danger]}>
            <Text style={styles.actionTxt}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Hábitos</Text>
        <TouchableOpacity onPress={openCreate} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {/* ====== INÍCIO DA ADIÇÃO: LEMBRETES DE BEM-ESTAR ====== */}
      <View
        style={{
          marginHorizontal: theme.spacing.lg,
          marginBottom: 16,
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.text, marginBottom: 12 }}>
          Lembretes de Bem-estar
        </Text>

        {/* Água */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontWeight: "600" }}>💧 Beber Água</Text>
            <Text style={{ color: theme.colors.textSecondary }}>Lembrete a cada 1h30</Text>
            {state.waterEnabled && (
              <Text style={{ color: theme.colors.success, marginTop: 4 }}>
                Ativo — {state.waterTodayCount}x hoje
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => toggleWater(!state.waterEnabled)}
            style={{
              backgroundColor: state.waterEnabled ? theme.colors.primary : theme.colors.surface,
              borderColor: state.waterEnabled ? theme.colors.primary : theme.colors.border,
              borderWidth: 1,
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: state.waterEnabled ? "#fff" : theme.colors.text }}>
              {state.waterEnabled ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={registerWater}
          style={{
            backgroundColor: theme.colors.primary + "22",
            padding: 10,
            borderRadius: 8,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>Bebi água ✓</Text>
        </TouchableOpacity>

        {/* Alongamento */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontWeight: "600" }}>🧘 Alongar e Movimentar</Text>
            <Text style={{ color: theme.colors.textSecondary }}>Lembrete a cada 2h</Text>
            {state.stretchEnabled && (
              <Text style={{ color: theme.colors.success, marginTop: 4 }}>
                Ativo — {state.stretchTodayCount}x hoje
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => toggleStretch(!state.stretchEnabled)}
            style={{
              backgroundColor: state.stretchEnabled ? theme.colors.primary : theme.colors.surface,
              borderColor: state.stretchEnabled ? theme.colors.primary : theme.colors.border,
              borderWidth: 1,
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: state.stretchEnabled ? "#fff" : theme.colors.text }}>
              {state.stretchEnabled ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={registerStretch}
          style={{
            backgroundColor: theme.colors.secondary + "22",
            padding: 10,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: theme.colors.secondary, fontWeight: "600" }}>Alonguei ✓</Text>
        </TouchableOpacity>
      </View>
      {/* ====== FIM DA ADIÇÃO ====== */}

      {/* Lista de hábitos */}
      <FlatList
        data={habits}
        keyExtractor={(h) => h.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={habits.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Você ainda não tem hábitos. Crie um agora e bora manter a sequência 💪
          </Text>
        }
      />

      {/* Modal criar/editar */}
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? "Editar hábito" : "Novo hábito"}</Text>

            <Text style={styles.label}>Título</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex.: Beber água"
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.input}
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Opcional"
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.input}
            />

            <Text style={styles.label}>Frequência</Text>
            <View style={styles.chipsRow}>
              {(["daily", "weekly", "monthly", "custom"] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setFrequency(opt)}
                  style={[
                    styles.chip,
                    frequency === opt && {
                      backgroundColor: theme.colors.primary + "22",
                      borderColor: theme.colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipTxt,
                      frequency === opt && { color: theme.colors.primary, fontWeight: "700" },
                    ]}
                  >
                    {ptFrequency(opt)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setVisible(false);
                  resetForm();
                }}
                style={[styles.btn, styles.btnGhost]}
              >
                <Text style={styles.btnGhostTxt}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onSave} style={[styles.btn, styles.btnPrimary]}>
                <Text style={styles.btnPrimaryTxt}>{editingId ? "Salvar" : "Criar"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ptFrequency(f: Habit["frequency"]) {
  switch (f) {
    case "daily":
      return "Diária";
    case "weekly":
      return "Semanal";
    case "monthly":
      return "Mensal";
    case "custom":
      return "Custom";
    default:
      return "Diária";
  }
}

function formatDate(iso: string) {
  try {
    const [y, m, d] = iso.split("T")[0].split("-");
    return `${d}/${m}/${y}`;
  } catch {
    return iso;
  }
}

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: { fontSize: 22, fontWeight: "700", color: theme.colors.text },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    addButtonText: { color: "#fff", fontWeight: "700" },
    separator: { height: 1, backgroundColor: theme.colors.border, marginHorizontal: theme.spacing.lg },
    emptyContainer: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.xl,
    },
    emptyText: { color: theme.colors.textSecondary, fontSize: 14, textAlign: "center" },
    item: {
      flexDirection: "row",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.md,
    },
    itemLeft: { flex: 1 },
    itemTitle: { color: theme.colors.text, fontSize: 16, fontWeight: "600" },
    itemDesc: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 2 },
    itemMeta: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 6 },
    bold: { fontWeight: "700" },
    actionsCol: { alignItems: "flex-end", gap: 6 },
    actionBtn: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
    },
    actionTxt: { color: theme.colors.text, fontSize: 12, fontWeight: "600" },
    actionTxtOnPrimary: { color: "#fff" },
    primary: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    neutral: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
    outline: { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
    danger: { backgroundColor: theme.colors.background, borderColor: theme.colors.danger },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    modalCard: {
      width: "100%",
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    label: { color: theme.colors.textSecondary, marginTop: theme.spacing.sm, marginBottom: 4, fontSize: 13 },
    input: {
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 10,
    },
    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
    chip: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.background,
    },
    chipTxt: { color: theme.colors.textSecondary, fontSize: 12 },
    modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: theme.spacing.lg },
    btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: theme.borderRadius.md, borderWidth: 1 },
    btnGhost: { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
    btnGhostTxt: { color: theme.colors.textSecondary, fontWeight: "700" },
    btnPrimary: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    btnPrimaryTxt: { color: "#fff", fontWeight: "700" },
  });

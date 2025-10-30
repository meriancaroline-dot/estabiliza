// src/components/GlassCard.tsx
import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { useTheme } from "@/hooks/useTheme"; // ✅ MUDANÇA AQUI

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pad?: number;
  border?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  style, 
  pad = 16, 
  border = true 
}) => {
  const { theme } = useTheme(); // ✅ Agora funciona

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface + "EE",
          borderColor: theme.colors.border,
          padding: pad,
          borderWidth: border ? 1 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    overflow: "hidden",
  },
});

export default GlassCard;
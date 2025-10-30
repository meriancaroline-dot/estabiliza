import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  variant?: "primary" | "secondary" | "outline"; // 👈 ADICIONADO
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled,
  loading,
  style,
  variant = "primary",
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const isDisabled = disabled || loading;

  const getVariantStyle = () => {
    switch (variant) {
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
      case "secondary":
        return {
          backgroundColor: theme.colors.secondary,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
        };
    }
  };

  const getTextColor = () => {
    return variant === "outline" ? theme.colors.primary : "#fff";
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyle(),
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    button: {
      paddingVertical: 12,
      borderRadius: theme.borderRadius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      fontWeight: "700",
      fontSize: 16,
    },
    disabled: {
      opacity: 0.5,
    },
  });

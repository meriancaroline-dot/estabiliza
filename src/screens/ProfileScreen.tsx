import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/hooks/useUser';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/Button';

export default function ProfileScreen() {
  const { user, patchUser, clearUser } = useUser();
  const { theme, mode, setThemeMode } = useTheme();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [notifEnabled, setNotifEnabled] = useState<boolean>(
    user?.preferences?.notificationsEnabled ?? true
  );
  const [saving, setSaving] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [greeting, setGreeting] = useState('');

  // -----------------------------------------------------------
  // 👋 Saudação personalizada
  // -----------------------------------------------------------
  useEffect(() => {
    const hour = new Date().getHours();
    let message = '';

    if (hour < 12) message = 'Bom dia';
    else if (hour < 18) message = 'Boa tarde';
    else message = 'Boa noite';

    const displayName = name || user?.name || 'bem-vinda';
    setGreeting(`${message}, ${displayName}! 🌿`);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }, 6000);

    return () => clearTimeout(timer);
  }, [name, user?.name]);

  // -----------------------------------------------------------
  // 📸 Escolher avatar
  // -----------------------------------------------------------
  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert('Permissão negada', 'Conceda acesso à galeria para mudar o avatar.');
    }

   const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ usa isso no Expo 54
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
});


    if (!result.canceled && result.assets?.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  // -----------------------------------------------------------
  // 💾 Salvar alterações
  // -----------------------------------------------------------
  const handleSave = async () => {
    try {
      setSaving(true);
      await patchUser({
        name,
        email,
        avatar,
        preferences: {
          themeMode: mode,
          notificationsEnabled: notifEnabled,
          dailyReminderTime: user?.preferences?.dailyReminderTime ?? '08:00',
        },
      });
      Alert.alert('✅ Sucesso', 'Perfil e preferências atualizados.');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------------------------
  // 🚪 Sair da conta
  // -----------------------------------------------------------
  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await clearUser();
          Alert.alert('👋 Até logo', 'Você saiu da sua conta.');
        },
      },
    ]);
  };

  // -----------------------------------------------------------
  // 🖼️ Interface
  // -----------------------------------------------------------
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* 👋 Saudação animada */}
      {greeting ? (
        <Animated.View
          style={{
            opacity: fadeAnim,
            marginBottom: theme.spacing.lg,
            padding: theme.spacing.md,
            backgroundColor: theme.isDark ? '#1f2937' : '#f1f5f9',
            borderRadius: theme.borderRadius.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 18,
              fontWeight: '600',
            }}
          >
            {greeting}
          </Text>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: 14,
              marginTop: 4,
            }}
          >
            É bom te ver por aqui. Que hoje seja leve 💫
          </Text>
        </Animated.View>
      ) : null}

      {/* Avatar */}
      <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
        <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8}>
          <View
            style={{
              borderWidth: 3,
              borderColor: theme.colors.primary,
              borderRadius: 70,
              padding: 3,
            }}
          >
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                }}
              />
            ) : (
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: theme.colors.surface,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.colors.textSecondary, fontSize: 36 }}>👤</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: 14,
            marginTop: theme.spacing.sm,
          }}
        >
          Toque para alterar foto
        </Text>
      </View>

      {/* Campos */}
      <View style={{ marginBottom: theme.spacing.lg }}>
        <Text style={{ color: theme.colors.text, fontSize: 16, marginBottom: 4 }}>Nome</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          placeholderTextColor={theme.colors.textSecondary}
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            borderColor: theme.colors.border,
            borderWidth: 1,
          }}
        />
      </View>

      <View style={{ marginBottom: theme.spacing.xl }}>
        <Text style={{ color: theme.colors.text, fontSize: 16, marginBottom: 4 }}>E-mail</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Seu e-mail"
          placeholderTextColor={theme.colors.textSecondary}
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            borderColor: theme.colors.border,
            borderWidth: 1,
          }}
        />
      </View>

      {/* Configurações */}
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: theme.spacing.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          marginBottom: theme.spacing.xl,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: theme.spacing.md,
          }}
        >
          Configurações
        </Text>

        {/* Notificações */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
            <Text style={{ color: theme.colors.text, fontSize: 16 }}>Notificações</Text>
          </View>
          <Switch
            value={notifEnabled}
            onValueChange={setNotifEnabled}
            thumbColor={notifEnabled ? theme.colors.primary : theme.colors.border}
          />
        </View>

        {/* Tema */}
        <View style={{ marginTop: theme.spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Ionicons name="color-palette-outline" size={20} color={theme.colors.text} />
            <Text style={{ color: theme.colors.text, fontSize: 16 }}>Tema</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="Claro" onPress={() => setThemeMode('light')} />
            <Button title="Escuro" onPress={() => setThemeMode('dark')} />
            <Button title="Sistema" onPress={() => setThemeMode('system')} />
          </View>
        </View>
      </View>

      {/* Salvar */}
      <Button
        title={saving ? 'Salvando...' : 'Salvar alterações'}
        onPress={handleSave}
        disabled={saving}
      />

      {saving && (
        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity
        onPress={handleLogout}
        activeOpacity={0.8}
        style={{
          marginTop: theme.spacing.xl,
          backgroundColor: theme.colors.danger,
          paddingVertical: 12,
          borderRadius: theme.borderRadius.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

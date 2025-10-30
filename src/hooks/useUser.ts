import { useCallback } from 'react';
import { useUser as useUserContext } from '@/contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/models';

// -------------------------------------------------------------
// Chave de armazenamento local
// -------------------------------------------------------------
const STORAGE_KEY = '@estabiliza:user';

// -------------------------------------------------------------
// Hook principal — integra UserContext com persistência local
// -------------------------------------------------------------
export function useUser() {
  const { user, updateUser, logout, refreshUser, isLoggedIn } = useUserContext();

  // Atualiza parcialmente o usuário
  const patchUser = useCallback(
    async (data: Partial<User>) => {
      try {
        if (!user) {
          console.warn('⚠️ Nenhum usuário logado para atualizar.');
          return;
        }

        const updated: User = { ...user, ...data };
        await updateUser(updated);
        console.log('👤 Usuário atualizado com sucesso:', updated.name);
      } catch (e) {
        console.error('Erro ao atualizar usuário:', e);
      }
    },
    [user, updateUser],
  );

  // Remove completamente os dados do usuário
  const clearUser = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await logout();
      console.log('🚪 Sessão encerrada e dados locais removidos.');
    } catch (e) {
      console.error('Erro ao limpar dados do usuário:', e);
    }
  }, [logout]);

  return {
    user,
    isLoggedIn,
    patchUser,
    clearUser,
    refreshUser,
  };
}

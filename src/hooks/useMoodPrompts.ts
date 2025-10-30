// src/hooks/useMoodPrompts.ts
import { useEffect } from 'react';
import { scheduleDaily } from '@/services/Notifications';

/**
 * Agenda 3 lembretes diários para o registro de humor:
 * manhã (09:00), tarde (14:00) e noite (20:00).
 */
export function useMoodPrompts() {
  useEffect(() => {
    (async () => {
      // Agenda manhã
      await scheduleDaily(
        'Como você está se sentindo?',
        'Registre seu humor da manhã.',
        { hour: 9, minute: 0 },
        'mood'
      );

      // Agenda tarde
      await scheduleDaily(
        'Como você está se sentindo?',
        'Registre seu humor da tarde.',
        { hour: 14, minute: 0 },
        'mood'
      );

      // Agenda noite
      await scheduleDaily(
        'Como você está se sentindo?',
        'Registre seu humor da noite.',
        { hour: 20, minute: 0 },
        'mood'
      );
    })();
  }, []);
}

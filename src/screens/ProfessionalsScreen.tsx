// src/screens/ProfessionalsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/Button';

const WHATSAPP_NUMBER = '5548999692926'; // 55 + 48 + 999692926 (sem símbolos)
const IG_URL =
  'https://www.instagram.com/mentesbipolaresconectadas?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==';

export default function ProfessionalsScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const openWhatsApp = async (preset: 'escuta' | 'profissionais') => {
    const textEscuta =
      'Olá! Gostaria de saber mais sobre o Espaço de Escuta (valores e pacotes).';
    const textProf =
      'Olá! Gostaria de informações sobre atendimento com profissionais parceiros (valores e funcionamento).';

    const msg = preset === 'escuta' ? textEscuta : textProf;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        // Android também aceita o esquema whatsapp:// se o app estiver instalado
        const fallback = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(
          msg,
        )}`;
        const canFallback = await Linking.canOpenURL(fallback);
        if (canFallback) return Linking.openURL(fallback);
        throw new Error('Nenhum aplicativo compatível encontrado.');
      }
      await Linking.openURL(url);
    } catch (e) {
      console.error(e);
      Alert.alert(
        'Não foi possível abrir o WhatsApp',
        'Verifique se o aplicativo está instalado ou tente novamente.',
      );
    }
  };

  const openInstagram = async () => {
    try {
      const supported = await Linking.canOpenURL(IG_URL);
      if (!supported) throw new Error('Link inválido');
      await Linking.openURL(IG_URL);
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível abrir o Instagram.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>Apoio Profissional & Espaço de Escuta</Text>
      <Text style={styles.subtitle}>
        Conte com nossa rede de apoio — desde uma escuta qualificada até atendimento com
        especialistas conveniados.
      </Text>

      {/* Espaço de Escuta */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Espaço de Escuta</Text>
        <Text style={styles.cardText}>
          O Espaço de Escuta é um ambiente para conversar com pessoas com{' '}
          <Text style={styles.bold}>escuta qualificada</Text> (não são profissionais
          formados). É um suporte humano, acolhedor e sem julgamentos — ideal para dividir
          sentimentos, organizar ideias e aliviar a sobrecarga.
        </Text>

        <View style={styles.bulletBox}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>
            <Text style={styles.bold}>Não é atendimento gratuito.</Text> Usuários do app
            têm <Text style={styles.bold}>60 minutos gratuitos</Text> no Espaço de Escuta.
          </Text>
        </View>
        <View style={styles.bulletBox}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>
            Pacientes de parceiros conveniados têm{' '}
            <Text style={styles.bold}>120 minutos gratuitos</Text> no Espaço de Escuta.
          </Text>
        </View>
        <View style={styles.bulletBox}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>
            Para <Text style={styles.bold}>valores</Text>,{' '}
            <Text style={styles.bold}>pacotes</Text> e agendamento, fale com a gente no
            WhatsApp.
          </Text>
        </View>

        <View style={styles.rowButtons}>
          <Button title="Falar no WhatsApp" onPress={() => openWhatsApp('escuta')} />
          <Button title="Abrir Instagram" onPress={openInstagram} />
        </View>
      </View>

      {/* Profissionais Parceiros */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profissionais Parceiros</Text>
        <Text style={styles.cardText}>
          Nossa rede de <Text style={styles.bold}>profissionais conveniados</Text> conta
          com <Text style={styles.bold}>psicólogos</Text>,{' '}
          <Text style={styles.bold}>psiquiatras</Text> e{' '}
          <Text style={styles.bold}>advogados especializados em saúde</Text>. Eles são
          qualificados para atender demandas clínicas, jurídicas e de cuidado contínuo.
        </Text>

        <View style={styles.bulletBox}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>
            Atendimentos <Text style={styles.bold}>não são gratuitos</Text>. Para{' '}
            <Text style={styles.bold}>valores de consulta</Text> e{' '}
            <Text style={styles.bold}>como funciona</Text>, chame no WhatsApp.
          </Text>
        </View>
        <View style={styles.bulletBox}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>
            Profissionais <Text style={styles.bold}>especializados</Text> e alinhados à
            nossa causa.
          </Text>
        </View>

        <View style={styles.rowButtons}>
          <Button title="Falar no WhatsApp" onPress={() => openWhatsApp('profissionais')} />
          <Button title="Abrir Instagram" onPress={openInstagram} />
        </View>
      </View>

      <Text style={styles.note}>
        Observação: minutos gratuitos aplicam-se exclusivamente ao Espaço de Escuta nas
        condições descritas acima — não se aplicam aos profissionais parceiros.
      </Text>
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.lg,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 8,
    },
    cardText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: theme.spacing.sm,
    },
    bold: { fontWeight: '700', color: theme.colors.text },
    bulletBox: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 6,
    },
    bullet: {
      color: theme.colors.textSecondary,
      fontSize: 18,
      lineHeight: 22,
      width: 16,
      textAlign: 'center',
    },
    bulletText: {
      flex: 1,
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    rowButtons: {
      flexDirection: 'row',
      gap: 10,
      marginTop: theme.spacing.md,
    },
    note: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      marginBottom: theme.spacing.xl,
      textAlign: 'center',
    },
  });

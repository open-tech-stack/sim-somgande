// src/components/ui/AlertModal.tsx
/**
 * Modal d'alerte global.
 * Affiché via le hook useAlert() (cf. context/AlertContext).
 */

import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react-native';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export type AlertKind = 'success' | 'error' | 'warning' | 'info';

export interface AlertConfig {
  title: string;
  message?: string;
  kind?: AlertKind;
  /** Texte du bouton (défaut : "OK") */
  buttonText?: string;
  /** Callback appelé au tap sur le bouton */
  onClose?: () => void;
}

interface Props {
  visible: boolean;
  config: AlertConfig | null;
  onDismiss: () => void;
}

export default function AlertModal({ visible, config, onDismiss }: Props) {
  const { colors } = useTheme();
  if (!config) return null;

  const kind = config.kind ?? 'info';

  const { tone, Icon } = (() => {
    switch (kind) {
      case 'success':
        return { tone: colors.success, Icon: CheckCircle2 };
      case 'error':
        return { tone: colors.danger, Icon: XCircle };
      case 'warning':
        return { tone: colors.warning, Icon: AlertTriangle };
      case 'info':
      default:
        return { tone: colors.info, Icon: Info };
    }
  })();

  const handleClose = () => {
    onDismiss();
    config.onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        onPress={handleClose}
      >
        {/* On stoppe la propagation du tap pour ne pas fermer au clic sur la carte */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Icône */}
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: tone + '22', borderColor: tone + '55' },
            ]}
          >
            <Icon size={28} color={tone} strokeWidth={2.4} />
          </View>

          {/* Titre */}
          <Text style={[styles.title, { color: colors.text }]}>
            {config.title}
          </Text>

          {/* Message */}
          {config.message && (
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {config.message}
            </Text>
          )}

          {/* Bouton */}
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: tone,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <Text style={styles.buttonText}>
              {config.buttonText ?? 'OK'}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  message: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: -Spacing.xs,
  },
  button: {
    marginTop: Spacing.md,
    height: 48,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
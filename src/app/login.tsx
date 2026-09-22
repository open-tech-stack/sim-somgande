// src/app/login.tsx
/**
 * Écran de connexion — design épuré premium.
 *
 * Design :
 *  - Fond animé : 3 gros cercles colorés flottants (rose/violet/orange)
 *  - Logo circulaire avec halo pulsant
 *  - Titre + sous-titre épurés
 *  - Input solide, contrasté, avec bordure 2px + accent au focus
 *  - Barre de progression + 10 points indicateurs
 *  - Message d'état dynamique
 *  - Bouton avec état loading + disabled
 *  - Footer discret
 *
 * Logique :
 *  - Login via l'API (POST /auth/login)
 *  - Gestion fine des erreurs (réseau, code invalide…)
 *  - Modale d'alerte pour les erreurs réseau
 */

import { Image } from 'expo-image';
import { KeyRound, LogIn, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useAlert } from '@/context/AlertContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

const { height } = Dimensions.get('window');
const CODE_LENGTH = 10;

// ------------------------------------------------------------------
// Validation locale du FORMAT (pas de la validité réelle du code)
// ------------------------------------------------------------------
function isValidCodeFormat(code: string): boolean {
  return /^[A-Z0-9]{10}$/.test(code.trim().toUpperCase());
}

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // ---- Animations ----
  const shake = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  // Fade-in global à l'apparition
  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fadeIn]);

  // Halo pulsant en boucle
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulse]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const canSubmit = code.length === CODE_LENGTH && !loading;
  const progress = code.length / CODE_LENGTH;

  // 🎨 Couleur de la barre en fonction de l'avancement
  const progressColor =
    code.length === 0
      ? 'transparent'
      : code.length < 4
        ? colors.danger
        : code.length < 7
          ? colors.warning
          : code.length < CODE_LENGTH
            ? colors.info
            : colors.success;

  // 📝 Message d'état dynamique
  const statusMessage = error
    ? error
    : code.length === 0
      ? 'En attente…'
      : code.length < 4
        ? 'Trop court'
        : code.length < 7
          ? 'Continuez…'
          : code.length < CODE_LENGTH
            ? 'Presque !'
            : '✓ Code complet';

  const handleSubmit = async () => {
    setError(null);

    if (!isValidCodeFormat(code)) {
      setError('Le code doit contenir 10 caractères (lettres et chiffres).');
      triggerShake();
      return;
    }

    setLoading(true);
    const result = await login(code);
    setLoading(false);

    if (result === 'ok') {
      router.replace('/(tabs)');
      return;
    }

    if (result === 'invalid') {
      setError('Code invalide. Vérifiez auprès du secrétariat.');
      triggerShake();
      return;
    }

    showAlert({
      title: 'Connexion impossible',
      message:
        'Impossible de joindre le serveur. Vérifie ta connexion internet et réessaie.',
      kind: 'error',
      buttonText: 'Réessayer',
    });
    triggerShake();
  };

  const shakeTranslate = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-8, 8],
  });

  const handleChange = (v: string) => {
    const cleaned = v
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, CODE_LENGTH);
    setCode(cleaned);
    if (error) setError(null);
  };

  // Halo pulsant (derrière le logo)
  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.15],
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      {/* ---------- Fond animé premium ---------- */}
      <AnimatedBackground intensity={0.95} />

      {/* ---------- Contenu ---------- */}
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Animated.View style={[styles.content, { opacity: fadeIn }]}>
          {/* Logo + halo */}
          <View style={styles.logoStage}>
            <Animated.View
              style={[
                styles.logoHalo,
                {
                  backgroundColor: colors.primary,
                  transform: [{ scale: pulseScale }],
                  opacity: pulseOpacity,
                },
              ]}
            />
            <View
              style={[
                styles.logoWrap,
                {
                  borderColor: 'rgba(255,255,255,0.2)',
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Image
                source={require('@/assets/images/wel01.jpg')}
                style={styles.logo}
                contentFit="cover"
              />
            </View>
          </View>

          {/* Titre */}
          <Text style={[styles.title, { color: colors.text }]}>
            Accès à l&apos;application
          </Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            Entrez le code à 10 caractères fourni par l&apos;administrateur.
          </Text>

          {/* ---------- Input ---------- */}
          <Animated.View
            style={[
              styles.inputWrap,
              {
                backgroundColor: colors.surface,
                borderColor: error
                  ? colors.danger
                  : focused
                    ? colors.primary
                    : colors.border,
                transform: [{ translateX: shakeTranslate }],
              },
            ]}
          >
            <KeyRound
              size={18}
              color={
                error
                  ? colors.danger
                  : focused
                    ? colors.primary
                    : colors.textMuted
              }
              strokeWidth={2.4}
            />

            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="A7K2P9M4X1"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="off"
              maxLength={CODE_LENGTH}
              style={[styles.input, { color: colors.text }]}
              onSubmitEditing={canSubmit ? handleSubmit : undefined}
              returnKeyType="go"
              editable={!loading}
              selectionColor={colors.primary}
            />

            {code.length > 0 && !loading && (
              <Pressable
                onPress={() => setCode('')}
                hitSlop={10}
                style={styles.clearBtn}
              >
                <View
                  style={[
                    styles.clearCircle,
                    { backgroundColor: colors.surfaceAlt },
                  ]}
                >
                  <X size={12} color={colors.textSecondary} strokeWidth={3} />
                </View>
              </Pressable>
            )}
          </Animated.View>

          {/* Barre d'accent sous l'input (indicateur de focus) */}
          <View style={styles.accentWrap}>
            <Animated.View
              style={[
                styles.accentBar,
                {
                  backgroundColor: focused
                    ? colors.primary
                    : error
                      ? colors.danger
                      : 'transparent',
                  width: focused || error ? '100%' : '0%',
                },
              ]}
            />
          </View>

          {/* ---------- Barre de progression + points ---------- */}
          <View style={styles.progressSection}>
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: colors.surfaceAlt },
              ]}
            >
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: progressColor,
                    shadowColor: progressColor,
                    shadowOpacity: code.length > 0 ? 0.8 : 0,
                  },
                ]}
              />
            </View>

            <View style={styles.statusRow}>
              <View style={styles.dots}>
                {Array.from({ length: CODE_LENGTH }).map((_, i) => {
                  const filled = i < code.length;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        {
                          backgroundColor: filled
                            ? progressColor
                            : colors.border,
                          transform: [{ scale: filled ? 1.3 : 1 }],
                        },
                      ]}
                    />
                  );
                })}
              </View>

              <Text
                style={[
                  styles.status,
                  {
                    color: error
                      ? colors.danger
                      : code.length === 0
                        ? colors.textMuted
                        : progressColor,
                  },
                ]}
                numberOfLines={2}
              >
                {statusMessage}
              </Text>
            </View>
          </View>

          {/* ---------- Bouton ---------- */}
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: canSubmit
                  ? colors.primary
                  : colors.surfaceAlt,
                shadowColor: canSubmit ? colors.primary : 'transparent',
                opacity: pressed && canSubmit ? 0.92 : 1,
                transform: [{ scale: pressed && canSubmit ? 0.98 : 1 }],
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <>
                <LogIn
                  size={18}
                  color={canSubmit ? colors.onPrimary : colors.textMuted}
                  strokeWidth={2.6}
                />
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: canSubmit ? colors.onPrimary : colors.textMuted,
                    },
                  ]}
                >
                  Se connecter
                </Text>
              </>
            )}
          </Pressable>
        </Animated.View>

        {/* ---------- Footer ---------- */}
        <Text style={[styles.footer, { color: colors.textMuted }]}>
          Accès réservé aux membres de l&apos;église
        </Text>
      </SafeAreaView>
    </View>
  );
}

// ------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------
const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },

  safe: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ---------- Logo ----------
  logoStage: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  logoHalo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: { width: '100%', height: '100%' },

  // ---------- Textes ----------
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  sub: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 18,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },

  // ---------- Input ----------
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 2,
    paddingHorizontal: Spacing.lg,
    height: 62,
    width: '100%',
    maxWidth: 360,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 4,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 2,
  },
  clearCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Barre d'accent sous l'input
  accentWrap: {
    width: '100%',
    maxWidth: 360,
    height: 2,
    marginTop: -2,
    overflow: 'hidden',
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
  },
  accentBar: {
    height: '100%',
    borderRadius: 1,
  },

  // ---------- Progress ----------
  progressSection: {
    width: '100%',
    maxWidth: 360,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    minHeight: 20,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  status: {
    flex: 1,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textAlign: 'right',
    letterSpacing: 0.2,
  },

  // ---------- Bouton ----------
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 56,
    borderRadius: Radius.pill,
    width: '100%',
    maxWidth: 360,
    marginTop: Spacing.xl,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonText: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // ---------- Footer ----------
  footer: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
  },
});
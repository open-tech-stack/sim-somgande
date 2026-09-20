// src/app/login.tsx
/**
 * Écran de connexion — design "carrés colorés sur fond sombre".
 * ⚠️ Le DESIGN est INCHANGÉ. Seule la logique a été mise à jour :
 *  - login via l'API (POST /auth/login)
 *  - gestion fine des erreurs (réseau, code invalide…)
 *  - modale d'alerte pour les erreurs réseau
 */

import { Image } from 'expo-image';
import { KeyRound, LogIn, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAlert } from '@/context/AlertContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { FontSize, Radius, Spacing } from '@/constants/theme';

const { width, height } = Dimensions.get('window');
const CODE_LENGTH = 10;

const TEXT_WHITE = '#FFFFFF';
const TEXT_WHITE_SOFT = 'rgba(255,255,255,0.75)';
const TEXT_WHITE_MUTED = 'rgba(255,255,255,0.55)';

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
  const inputRef = useRef<TextInput>(null);

  const shake = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const canSubmit = code.length === CODE_LENGTH && !loading;

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

    // result === 'error' → erreur réseau ou serveur
    showAlert({
      title: 'Connexion impossible',
      message:
        "Impossible de joindre le serveur. Vérifie ta connexion internet et réessaie.",
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

  const decos = React.useMemo(
    () => [
      { size: 18, x: width * 0.06, y: height * 0.12, color: TEXT_WHITE, rotation: 15 },
      { size: 12, x: width * 0.22, y: height * 0.20, color: colors.primary, rotation: -10 },
      { size: 14, x: width * 0.05, y: height * 0.28, color: TEXT_WHITE, rotation: 30 },
      { size: 16, x: width * 0.45, y: height * 0.18, color: colors.primary, rotation: -20 },
      { size: 20, x: width * 0.60, y: height * 0.16, color: TEXT_WHITE, rotation: 25 },
      { size: 14, x: width * 0.10, y: height * 0.42, color: TEXT_WHITE, rotation: -15 },
      { size: 12, x: width * 0.90, y: height * 0.38, color: colors.primary, rotation: 20 },
      { size: 16, x: width * 0.55, y: height * 0.48, color: TEXT_WHITE, rotation: -25 },
      { size: 14, x: width * 0.80, y: height * 0.62, color: TEXT_WHITE, rotation: 10 },
      { size: 18, x: width * 0.10, y: height * 0.68, color: colors.primary, rotation: -20 },
      { size: 12, x: width * 0.92, y: height * 0.78, color: TEXT_WHITE, rotation: 15 },
      { size: 16, x: width * 0.35, y: height * 0.72, color: colors.primary, rotation: -30 },
      { size: 20, x: width * 0.72, y: height * 0.88, color: TEXT_WHITE, rotation: 20 },
      { size: 14, x: width * 0.15, y: height * 0.90, color: colors.primary, rotation: -10 },
    ],
    [colors.primary],
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      {/* Fond décoratif */}
      <View
        pointerEvents="none"
        style={[
          styles.bigSquareWrapper,
          { top: -height * 0.08, right: -width * 0.35 },
        ]}
      >
        <View
          style={[
            styles.bigSquare,
            {
              width: width * 0.85,
              height: width * 0.85,
              borderRadius: 60,
              backgroundColor: colors.primary,
              transform: [{ rotate: '-15deg' }],
            },
          ]}
        />
      </View>

      <View
        pointerEvents="none"
        style={[
          styles.bigSquareWrapper,
          { bottom: -height * 0.08, left: -width * 0.35 },
        ]}
      >
        <View
          style={[
            styles.bigSquare,
            {
              width: width * 0.85,
              height: width * 0.85,
              borderRadius: 60,
              backgroundColor: colors.primary,
              transform: [{ rotate: '-15deg' }],
            },
          ]}
        />
      </View>

      {decos.map((d, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: d.x,
            top: d.y,
            width: d.size,
            height: d.size,
            borderRadius: 3,
            borderWidth: 2,
            borderColor: d.color,
            transform: [{ rotate: `${d.rotation}deg` }],
            opacity: 0.85,
          }}
        />
      ))}

      {/* Contenu */}
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View
            style={[styles.logoWrap, { borderColor: 'rgba(255,255,255,0.2)' }]}
          >
            <Image
              source={require('@/assets/images/wel01.jpg')}
              style={styles.logo}
              contentFit="cover"
            />
          </View>

          <Text style={styles.title}>Accès à l'application</Text>
          <Text style={styles.sub}>Entrez le code à 10 caractères.</Text>

          <Animated.View
            style={[
              styles.inputWrap,
              {
                backgroundColor: colors.surface,
                borderColor: error ? colors.danger : 'rgba(255,255,255,0.2)',
                transform: [{ translateX: shakeTranslate }],
              },
            ]}
          >
            <KeyRound
              size={18}
              color={error ? colors.danger : TEXT_WHITE_SOFT}
              strokeWidth={2.4}
            />
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleChange}
              placeholder="Ex : A7K2P9M4X1"
              placeholderTextColor={TEXT_WHITE_MUTED}
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="off"
              maxLength={CODE_LENGTH}
              style={styles.input}
              onSubmitEditing={canSubmit ? handleSubmit : undefined}
              returnKeyType="go"
            />
            {code.length > 0 && (
              <Pressable onPress={() => setCode('')} hitSlop={8}>
                <X size={16} color={TEXT_WHITE_SOFT} strokeWidth={2.4} />
              </Pressable>
            )}
          </Animated.View>

          <View style={styles.helperRow}>
            <Text style={styles.helper}>
              {code.length}/{CODE_LENGTH}
            </Text>
            {error && (
              <Text style={[styles.error, { color: colors.danger }]}>
                {error}
              </Text>
            )}
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: canSubmit
                  ? colors.primary
                  : 'rgba(255,255,255,0.1)',
                opacity: pressed && canSubmit ? 0.9 : 1,
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
                  color={canSubmit ? colors.onPrimary : TEXT_WHITE_MUTED}
                  strokeWidth={2.6}
                />
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: canSubmit ? colors.onPrimary : TEXT_WHITE_MUTED,
                    },
                  ]}
                >
                  Se connecter
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <Text style={styles.footer}>
          Accès réservé aux membres de l'église
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  bigSquareWrapper: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  bigSquare: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  safe: { flex: 1, paddingHorizontal: Spacing.xl, justifyContent: 'space-between' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  logoWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: { width: '100%', height: '100%' },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    letterSpacing: 0.4,
    color: TEXT_WHITE,
    textAlign: 'center',
  },
  sub: {
    fontSize: FontSize.md,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 20,
    color: TEXT_WHITE_SOFT,
    marginBottom: Spacing.md,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    height: 56,
    width: '100%',
    maxWidth: 340,
  },
  input: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '800',
    letterSpacing: 3,
    paddingVertical: 0,
    color: TEXT_WHITE,
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 340,
    minHeight: 18,
    paddingHorizontal: 2,
  },
  helper: { fontSize: FontSize.xs, fontWeight: '600', color: TEXT_WHITE_SOFT },
  error: { fontSize: FontSize.xs, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 54,
    borderRadius: Radius.pill,
    width: '100%',
    maxWidth: 340,
    marginTop: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonText: { fontSize: FontSize.lg, fontWeight: '800', letterSpacing: 0.6 },
  footer: { textAlign: 'center', fontSize: FontSize.xs, marginBottom: Spacing.md, color: TEXT_WHITE_MUTED },
});
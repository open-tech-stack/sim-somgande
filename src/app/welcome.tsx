// src/app/welcome.tsx
/**
 * Écran Welcome — affiché UNIQUEMENT à la première ouverture.
 *
 * Design moderne et cohérent avec l'app :
 *  - Fond uni aux couleurs du thème actif
 *  - Cercles décoratifs colorés flottants (rappel de l'ambiance)
 *  - Petits cercles outline blancs (touche premium)
 *  - Carte portrait centrale (wel01) avec coins arrondis
 *  - Halo pulsant + flottement
 *  - Tagline + bouton "Commencer" + footer
 */

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/context/OnboardingContext';
import { useTheme } from '@/context/ThemeContext';

const { width, height } = Dimensions.get('window');

/** Largeur de l'image-carte (portrait) */
const CARD_WIDTH = Math.min(width * 0.66, 280);
/** Ratio portrait 3:4 */
const CARD_HEIGHT = CARD_WIDTH * 1.35;
/** Rayon des coins de la carte */
const CARD_RADIUS = Radius.xl;

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const { markWelcomeSeen } = useOnboarding();
  const router = useRouter();

  // ---- Animations ----
  const fade = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.7)).current;
  const float = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(20)).current;
  const btnY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(btnY, {
          toValue: 0,
          duration: 500,
          delay: 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Flottement
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Halo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fade, cardScale, float, pulse, textY, btnY]);

  const handleStart = () => {
    markWelcomeSeen();
    router.replace('/login');
  };

  const floatTranslate = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });
  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.3],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0],
  });

  // ---- Palette de cercles décoratifs (fixe mais issue du thème) ----
  const circles = useMemo(
    () => [
      // Gros cercles
      { size: 280, color: colors.primary,      x: -80,  y: -60,  opacity: 0.18 },
      { size: 200, color: colors.primarySoft,  x: width - 120, y: height * 0.1, opacity: 0.15 },
      { size: 240, color: colors.warning,      x: -100, y: height * 0.55, opacity: 0.12 },
      { size: 180, color: colors.success,      x: width - 90,  y: height * 0.75, opacity: 0.13 },
      { size: 160, color: colors.info,         x: -60,  y: height * 0.8,  opacity: 0.14 },
      { size: 140, color: colors.danger,       x: width - 70,  y: height * 0.4,  opacity: 0.12 },
      // Petits cercles outline blancs
      { size: 34, color: '#FFFFFF', x: width * 0.12, y: height * 0.1,  opacity: 0.7, outline: true },
      { size: 22, color: '#FFFFFF', x: width * 0.78, y: height * 0.18, opacity: 0.6, outline: true },
      { size: 42, color: '#FFFFFF', x: width * 0.7,  y: height * 0.62, opacity: 0.75, outline: true },
      { size: 28, color: '#FFFFFF', x: width * 0.15, y: height * 0.72, opacity: 0.65, outline: true },
    ],
    [colors, width, height]
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      {/* ============ CERCLES DÉCORATIFS ============ */}
      {circles.map((c, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={[
            styles.decorCircle,
            {
              width: c.size,
              height: c.size,
              borderRadius: c.size / 2,
              left: c.x,
              top: c.y,
              opacity: c.opacity,
              backgroundColor: c.outline ? 'transparent' : c.color,
              borderWidth: c.outline ? 3 : 0,
              borderColor: c.outline ? c.color : undefined,
            },
          ]}
        />
      ))}

      {/* ============ CONTENU ============ */}
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Animated.View style={[styles.content, { opacity: fade }]}>
          {/* Halo + carte portrait flottante */}
          <View style={styles.imageStage}>
            <Animated.View
              style={[
                styles.pulse,
                {
                  backgroundColor: colors.primary,
                  transform: [{ scale: pulseScale }],
                  opacity: pulseOpacity,
                },
              ]}
            />

            <Animated.View
              style={{
                transform: [
                  { scale: cardScale },
                  { translateY: floatTranslate },
                ],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 14 },
                shadowOpacity: 0.5,
                shadowRadius: 28,
                elevation: 18,
              }}
            >
              <View style={styles.cardWrapper}>
                <Image
                  source={require('@/assets/images/wel01.jpg')}
                  style={styles.cardImage}
                  contentFit="cover"
                  transition={300}
                />
                {/* Cadre translucide intérieur (rappel de l'image référence) */}
                <View
                  style={[
                    styles.cardFrame,
                    {
                      borderColor: 'rgba(255,255,255,0.35)',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                    },
                  ]}
                  pointerEvents="none"
                />
              </View>
            </Animated.View>
          </View>

          {/* Tagline */}
          <Animated.View
            style={{ transform: [{ translateY: textY }], alignItems: 'center' }}
          >
            <Text style={[styles.tagline, { color: colors.text }]}>
              Restez connecté à la vie de l'église — programmes, événements et
              annonces, où que vous soyez.
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Bouton */}
        <Animated.View
          style={{ transform: [{ translateY: btnY }], opacity: fade }}
        >
          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
              Commencer
            </Text>
          </Pressable>

          <Text style={[styles.footer, { color: colors.textMuted }]}>
            Aucun compte requis · Accès libre
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },

  // Cercles décoratifs (positionnés en absolu)
  decorCircle: {
    position: 'absolute',
  },

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

  imageStage: {
    width: CARD_WIDTH * 1.5,
    height: CARD_HEIGHT * 1.35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },

  // Halo pulsant
  pulse: {
    position: 'absolute',
    width: CARD_WIDTH * 1.1,
    height: CARD_HEIGHT * 1.1,
    borderRadius: CARD_RADIUS * 3,
  },

  // Carte portrait
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardFrame: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: CARD_RADIUS,
    borderWidth: 1.5,
  },

  tagline: {
    fontSize: FontSize.lg,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
    paddingHorizontal: Spacing.md,
    fontWeight: '500',
  },

  button: {
    height: 58,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  footer: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    marginBottom: Spacing.md,
  },
});
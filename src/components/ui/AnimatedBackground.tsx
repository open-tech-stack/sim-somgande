// src/components/AnimatedBackground.tsx
/**
 */

import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  View,
} from 'react-native';

import { useTheme } from '@/context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface AnimatedBackgroundProps {
  intensity?: number;
}

export default function AnimatedBackground({
  intensity = 1,
}: AnimatedBackgroundProps) {
  const { colors } = useTheme();

  // ---- Animations (3 cercles indépendants) ----
  const t1 = useRef(new Animated.Value(0)).current;
  const t2 = useRef(new Animated.Value(0)).current;
  const t3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (value: Animated.Value, duration: number, delay = 0) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration,
            delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );

    const a1 = loop(t1, 5500);
    const a2 = loop(t2, 6500, 500);
    const a3 = loop(t3, 7000, 1000);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [t1, t2, t3]);


  const blobs = useMemo(
    () => [
      {
        // 🩷 Rose fuchsia — haut gauche
        anim: t1,
        baseSize: width * 0.75,
        color: '#FF2D7A',           // fuchsia
        haloColor: '#FF2D7A',
        startX: -width * 0.25,
        startY: -height * 0.05,
        rangeX: 40,
        rangeY: 30,
        opacity: 0.85 * intensity,
      },
      {
        // 💜 Violet profond — bas droite
        anim: t2,
        baseSize: width * 0.9,
        color: '#080300',           // violet
        haloColor: '#8B2FFF',
        startX: width * 0.35,
        startY: height * 0.55,
        rangeX: -50,
        rangeY: -40,
        opacity: 0.8 * intensity,
      },
      {
        // 🧡 Orange — milieu droite (petit)
        anim: t3,
        baseSize: width * 0.35,
        color: '#FF5A3D',           // orange
        haloColor: '#FF5A3D',
        startX: width * 0.62,
        startY: height * 0.32,
        rangeX: 25,
        rangeY: 40,
        opacity: 0.9 * intensity,
      },
    ],
    [t1, t2, t3, intensity],
  );

  return (
    <View
      pointerEvents="none"
      style={[styles.root, { backgroundColor: colors.background }]}
    >
      {blobs.map((b, i) => {
        // Translation douce
        const translateX = b.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, b.rangeX],
        });
        const translateY = b.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, b.rangeY],
        });
        // Léger scale pour effet "respiration"
        const scale = b.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.08],
        });

        return (
          <React.Fragment key={i}>
            {/* Halo diffus (cercle plus grand, plus transparent) */}
            <Animated.View
              style={[
                styles.halo,
                {
                  width: b.baseSize * 1.6,
                  height: b.baseSize * 1.6,
                  borderRadius: (b.baseSize * 1.6) / 2,
                  left: b.startX - b.baseSize * 0.3,
                  top: b.startY - b.baseSize * 0.3,
                  backgroundColor: b.haloColor,
                  opacity: b.opacity * 0.25,
                  transform: [{ translateX }, { translateY }, { scale }],
                },
              ]}
            />

            {/* Cercle principal */}
            <Animated.View
              style={[
                styles.circle,
                {
                  width: b.baseSize,
                  height: b.baseSize,
                  borderRadius: b.baseSize / 2,
                  left: b.startX,
                  top: b.startY,
                  backgroundColor: b.color,
                  opacity: b.opacity,
                  transform: [{ translateX }, { translateY }, { scale }],
                },
              ]}
            />
          </React.Fragment>
        );
      })}

      {/* Vignette (assombrit les bords → focus sur le centre) */}
      <View style={styles.vignette} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },

  circle: {
    position: 'absolute',
    // Ombre colorée pour un léger "glow"
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 8,
  },

  halo: {
    position: 'absolute',
    // Pas d'ombre ici : c'est déjà le halo
  },

  vignette: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'transparent',
  },
});
// src/components/TabBar.tsx
/**
 * Barre d'onglets flottante avec bouton central "+".
 * Le bouton déploie une bulle de raccourcis AU-DESSUS de la tab bar.
 *
 * Ordre final :
 *   [ Programmes ] [ Accueil ] [ + ] [ Événements ] [ Infos ]
 *
 * La bulle contient : Prières, Rappels, Notifications.
 */

import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Bell, Heart, Plus, StickyNote } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useNotifications } from '@/context/NotificationsContext';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

const BAR_WIDTH = Math.min(width * 0.92, 460);
const BAR_HEIGHT = 64;
const SUBMENU_HEIGHT = 82;
const SUBMENU_GAP = 55;

const MAIN_TAB_NAMES = ['programmes', 'index', 'evenements', 'infos'] as const;

// ------------------------------------------------------------------
// Liens secondaires
// ------------------------------------------------------------------
interface SubMenuItem {
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  route: string;
  showBadge?: boolean;
}

const SUB_ITEMS: SubMenuItem[] = [
  { label: 'Prières', icon: Heart, route: '/(tabs)/prieres' },
  { label: 'Rappels', icon: StickyNote, route: '/(tabs)/rappels' },
  { label: 'Notifications', icon: Bell, route: '/notifications', showBadge: true },
];

// ------------------------------------------------------------------
// TabBar
// ------------------------------------------------------------------
export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  const mainRoutes = state.routes
    .map((route, originalIndex) => ({ route, originalIndex }))
    .filter(({ route }) =>
      MAIN_TAB_NAMES.includes(route.name as (typeof MAIN_TAB_NAMES)[number]),
    );

  const toggleMenu = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    setMenuOpen((v) => !v);
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { bottom: Math.max(insets.bottom, Spacing.md) },
      ]}
    >
      {/* ============= BULLE DE RACCOURCIS ============= */}
      <SubMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ============= TAB BAR PRINCIPALE ============= */}
      <View
        style={[
          styles.bar,
          {
            width: BAR_WIDTH,
            height: BAR_HEIGHT,
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {mainRoutes.map(({ route, originalIndex }, index) => {
          const tabItem = (
            <TabItem
              key={route.key}
              isFocused={state.index === originalIndex}
              options={descriptors[route.key].options as any}
              onPress={() => handleTabPress(route, originalIndex)}
            />
          );

          // Le "+" est inséré APRÈS le 2e onglet (Accueil)
          // → ordre visuel : [0] [1] [+] [2] [3]
          if (index === 1) {
            return (
              <React.Fragment key={`${route.key}-center-slot`}>
                {tabItem}
                <CenterButton open={menuOpen} onPress={toggleMenu} />
              </React.Fragment>
            );
          }

          return tabItem;
        })}
      </View>
    </View>
  );

  function handleTabPress(route: any, index: number) {
    const isFocused = state.index === index;
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync().catch(() => {});
      }
      if (menuOpen) setMenuOpen(false);
      navigation.navigate(route.name);
    }
  }
}

// ------------------------------------------------------------------
// Bouton "+" central
// ------------------------------------------------------------------
function CenterButton({
  open,
  onPress,
}: {
  open: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(rotate, {
        toValue: open ? 1 : 0,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: open ? 1.08 : 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start();
  }, [open, rotate, scale]);

  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <Pressable onPress={onPress} style={styles.centerPressable}>
      {/* Losange coloré (rotation fixe 45°) */}
      <Animated.View
        style={[
          styles.centerDiamond,
          { transform: [{ rotate: '45deg' }, { scale }] },
        ]}
      >
        <View style={[styles.centerFill, { backgroundColor: colors.primary }]} />
        <View
          style={[
            styles.centerFill,
            { backgroundColor: colors.primarySoft + '80', opacity: 0.7 },
          ]}
        />
      </Animated.View>

      {/* Icône + / × */}
      <Animated.View
        style={[styles.centerIcon, { transform: [{ rotate: rotation }] }]}
        pointerEvents="none"
      >
        <Plus size={22} color="#FFFFFF" strokeWidth={3} />
      </Animated.View>
    </Pressable>
  );
}

// ------------------------------------------------------------------
// Bulle de raccourcis (sous-menu)
// ------------------------------------------------------------------
function SubMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const { unreadCount } = useNotifications();
  const router = useRouter();

  // Animations
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const wrapperHeight = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(24)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (open) {
      // ============ ENTRÉE ============
      Animated.parallel([
        // Backdrop
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Hauteur du wrapper (pousse le contenu au-dessus)
        Animated.timing(wrapperHeight, {
          toValue: SUBMENU_HEIGHT + SUBMENU_GAP + 16,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        // Card
        Animated.spring(cardOpacity, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 100,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 7,
          tension: 110,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
          tension: 120,
        }),
      ]).start();
    } else {
      // ============ SORTIE ============
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(wrapperHeight, {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslateY, {
          toValue: 16,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 0.95,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [
    open,
    backdropOpacity,
    wrapperHeight,
    cardOpacity,
    cardTranslateY,
    cardScale,
  ]);

  const handlePress = (route: string) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    onClose();
    setTimeout(() => router.push(route as any), 220);
  };

  return (
    <>
      {/* Backdrop cliquable */}
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose} />
      </Animated.View>

      {/* Wrapper animé en hauteur */}
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[styles.subMenuWrapper, { height: wrapperHeight }]}
      >
        <Animated.View
          style={[
            styles.bubbleContainer,
            {
              opacity: cardOpacity,
              transform: [
                { translateY: cardTranslateY },
                { scale: cardScale },
              ],
            },
          ]}
        >
          {/* ============ CARD (bulle) ============ */}
          <View
            style={[
              styles.subMenuCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.subMenuHeader}>
              <View style={styles.headerLeft}>
                <View
                  style={[
                    styles.headerDot,
                    { backgroundColor: colors.primary },
                  ]}
                />
                <Text
                  style={[
                    styles.subMenuHeaderText,
                    { color: colors.textMuted },
                  ]}
                >
                  ACCÈS RAPIDE
                </Text>
              </View>
              <Text
                style={[
                  styles.subMenuHeaderCount,
                  { color: colors.textMuted },
                ]}
              >
                {SUB_ITEMS.length} raccourcis
              </Text>
            </View>

            {/* Divider */}
            <View
              style={[
                styles.subMenuDivider,
                { backgroundColor: colors.border },
              ]}
            />

            {/* Items */}
            <View style={styles.subMenuItems}>
              {SUB_ITEMS.map((item) => {
                const Icon = item.icon;
                const showBadge = item.showBadge && unreadCount > 0;

                return (
                  <Pressable
                    key={item.route}
                    onPress={() => handlePress(item.route)}
                    style={({ pressed }) => [
                      styles.subItem,
                      {
                        backgroundColor: pressed
                          ? colors.surfaceAlt
                          : 'transparent',
                        transform: [{ scale: pressed ? 0.96 : 1 }],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.subIconWrap,
                        {
                          backgroundColor: colors.primary + '14',
                          borderColor: colors.primary + '33',
                        },
                      ]}
                    >
                      <Icon
                        size={20}
                        color={colors.primary}
                        strokeWidth={2.4}
                      />

                      {showBadge && (
                        <View
                          style={[
                            styles.subBadge,
                            { backgroundColor: colors.danger },
                          ]}
                        >
                          <Text style={styles.subBadgeText}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.subLabel,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ============ QUEUE (triangle vers le +) ============ */}
          <View
            style={[
              styles.tail,
              {
                borderTopColor: colors.surface,
              },
            ]}
          />
        </Animated.View>
      </Animated.View>
    </>
  );
}

// ------------------------------------------------------------------
// Onglet normal
// ------------------------------------------------------------------
function TabItem({
  isFocused,
  options,
  onPress,
}: {
  isFocused: boolean;
  options: {
    tabBarIcon?: (p: { focused: boolean; color: string; size: number }) => React.ReactNode;
    title?: string;
  };
  onPress: () => void;
}) {
  const { colors } = useTheme();

  const scale = useRef(new Animated.Value(1)).current;
  const dotScale = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isFocused ? 1.06 : 1,
        useNativeDriver: true,
        friction: 6,
        tension: 140,
      }),
      Animated.spring(dotScale, {
        toValue: isFocused ? 1 : 0,
        useNativeDriver: true,
        friction: 6,
      }),
    ]).start();
  }, [isFocused, scale, dotScale]);

  const tint = isFocused ? colors.primary : colors.tabInactive;

  return (
    <Pressable onPress={onPress} style={styles.itemPressable}>
      <Animated.View style={{ alignItems: 'center', transform: [{ scale }] }}>
        {options.tabBarIcon?.({
          focused: isFocused,
          color: tint,
          size: isFocused ? 24 : 22,
        })}

        <Animated.View
          style={[
            styles.dot,
            {
              backgroundColor: colors.primary,
              transform: [{ scale: dotScale }],
              opacity: dotScale,
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

// ------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------
const styles = StyleSheet.create({
  // --------- Wrapper global ---------
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    overflow: 'visible',
    zIndex: 20,
  },

  // --------- Backdrop ---------
  backdrop: {
    position: 'absolute',
    top: -2000,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  backdropPressable: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  // --------- Tab bar principale ---------
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 10,
  },
  itemPressable: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 4,
  },

  // --------- Bouton central "+" ---------
  centerPressable: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  centerDiamond: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
    overflow: 'hidden',
  },
  centerFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centerIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --------- Wrapper du sous-menu (hauteur animée) ---------
  subMenuWrapper: {
    width: BAR_WIDTH,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 20,
  },

  // --------- Container bulle (card + queue) ---------
  bubbleContainer: {
    width: '100%',
    alignItems: 'center',
  },

  // --------- CARD du sous-menu ---------
  subMenuCard: {
    width: '100%',
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 16,
  },

  // --------- Queue (triangle vers le bas, centré) ---------
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    // borderTopColor défini inline
    marginTop: -1,
  },

  // --------- Header ---------
  subMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  subMenuHeaderText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  subMenuHeaderCount: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  subMenuDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    opacity: 0.6,
  },

  // --------- Items ---------
  subMenuItems: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
  },
  subItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.lg,
  },
  subIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subLabel: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  subBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
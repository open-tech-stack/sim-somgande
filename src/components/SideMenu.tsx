// src/components/SideMenu.tsx
/**
 * Menu latéral custom (drawer) depuis la gauche.
 * - Navigation (tabs + prières + rappels)
 * - Section Notifications avec badge
 * - Bouton déconnexion
 */

import {
  Bell,
  CalendarDays,
  Heart,
  Home,
  LogOut,
  Megaphone,
  PartyPopper,
  X,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  APP_NAME,
  APP_SUBTITLE,
  FontSize,
  Radius,
  Spacing,
} from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useNotifications } from '@/context/NotificationsContext';

const { width } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(width * 0.82, 340);

interface MenuItem {
  label: string;
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
  route: string;
}

const NAV_ITEMS: MenuItem[] = [
  { label: 'Accueil', icon: Home, route: '/(tabs)' },
  { label: 'Programmes', icon: CalendarDays, route: '/(tabs)/programmes' },
  { label: 'Événements', icon: PartyPopper, route: '/(tabs)/evenements' },
  { label: 'Infos', icon: Megaphone, route: '/(tabs)/infos' },
];


interface Props {
  open: boolean;
  onClose: () => void;
  /** Nombre de notifications non lues (0 = pas de badge) */
  notificationCount?: number;
  /** Callback pour ouvrir l'écran de notifications */
  onNotificationsPress?: () => void;
}

export default function SideMenu({
  open,
  onClose,
  notificationCount = 0,
  onNotificationsPress,
}: Props) {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();

  const translateX = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: open ? 0 : -PANEL_WIDTH,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: open ? 1 : 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [open, translateX, overlayOpacity]);

  if (!open) return null;

  const go = (route: string) => {
    onClose();
    setTimeout(() => router.push(route as any), 180);
  };

  const handleLogout = () => {
    Alert.alert(
      'Se déconnecter',
      'Vous devrez saisir à nouveau votre code pour revenir.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            onClose();
            await logout();
          },
        },
      ],
    );
  };

  const handleNotifications = () => {
    onClose();
    setTimeout(() => onNotificationsPress?.(), 180);
  };

  return (
    <View style={styles.absoluteFill} pointerEvents="box-none">
      {/* Overlay */}
      <Animated.View
        style={[
          styles.absoluteFill,
          { backgroundColor: colors.overlay, opacity: overlayOpacity },
        ]}
      >
        <Pressable style={styles.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Panneau */}
      <Animated.View
        style={[
          styles.panel,
          {
            width: PANEL_WIDTH,
            backgroundColor: colors.surface,
            borderRightColor: colors.border,
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.lg,
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={styles.panelHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.brand, { color: colors.text }]}>
              {APP_NAME}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {APP_SUBTITLE}
            </Text>
            {user?.code && (
              <Text
                style={[styles.userCode, { color: colors.primary }]}
                numberOfLines={1}
              >
                🔑 {user.code}
              </Text>
            )}
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={10}
            style={({ pressed }) => [
              styles.closeBtn,
              {
                backgroundColor: pressed ? colors.surfaceAlt : 'transparent',
                borderColor: colors.border,
              },
            ]}
          >
            <X size={20} color={colors.text} strokeWidth={2.2} />
          </Pressable>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: Spacing.lg }}
          showsVerticalScrollIndicator={false}
        >
          <SectionLabel colors={colors} label="NAVIGATION" />
          {NAV_ITEMS.map((item) => (
            <MenuRow key={item.label} item={item} colors={colors} onPress={go} />
          ))}

        
        </ScrollView>

        {/* Bouton déconnexion */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            {
              backgroundColor: pressed ? colors.danger + '22' : 'transparent',
              borderColor: colors.danger + '55',
            },
          ]}
        >
          <LogOut size={16} color={colors.danger} strokeWidth={2.4} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>
            Se déconnecter
          </Text>
        </Pressable>

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          Version 1.0.0
        </Text>
      </Animated.View>
    </View>
  );
}

function SectionLabel({
  label,
  colors,
}: {
  label: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
      {label}
    </Text>
  );
}

function MenuRow({
  item,
  colors,
  onPress,
}: {
  item: MenuItem;
  colors: ReturnType<typeof useTheme>['colors'];
  onPress: (route: string) => void;
}) {
  const Icon = item.icon;
  return (
    <Pressable
      onPress={() => onPress(item.route)}
      style={({ pressed }) => [
        styles.menuRow,
        { backgroundColor: pressed ? colors.surfaceAlt : 'transparent' },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
        ]}
      >
        <Icon size={18} color={colors.primary} strokeWidth={2.2} />
      </View>
      <Text style={[styles.menuLabel, { color: colors.text }]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  absoluteFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  brand: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: FontSize.xs,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  userCode: {
    fontSize: FontSize.sm,
    marginTop: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: 2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: { fontSize: FontSize.md, fontWeight: '600', flex: 1 },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  logoutText: { fontSize: FontSize.sm, fontWeight: '800', letterSpacing: 0.4 },
  footer: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    paddingTop: Spacing.md,
  },
});
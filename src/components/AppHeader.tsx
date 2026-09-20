// src/components/AppHeader.tsx
/**
 * Header fixe.
 * À gauche : logo + (SSI / sous-titre)
 * À droite : [🌗 thème] [🔔 notif] [👤 user menu]
 *
 * Le bouton "user" ouvre un menu déroulant avec :
 *  - nom complet de la personne liée
 *  - code d'accès
 *  - bouton Se déconnecter
 */

import { Image } from 'expo-image';
import { Bell, LogOut, Palette, User as UserIcon } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
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
import { useNotifications } from '@/context/NotificationsContext';
import { useTheme } from '@/context/ThemeContext';

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function initialsFromFullName(fullName: string | null, fallback = '?'): string {
  if (!fullName) return fallback;
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
}

// ------------------------------------------------------------------
// Props
// ------------------------------------------------------------------
interface Props {
  onThemePress: () => void;
  onNotificationsPress: () => void;
}

// ------------------------------------------------------------------
// Composant
// ------------------------------------------------------------------
export default function AppHeader({
  onThemePress,
  onNotificationsPress,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();
  const { user, logout } = useAuth();

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const displayName =
    user?.fullName?.trim() || (user?.code ? `Code ${user.code}` : 'Utilisateur');

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          paddingTop: insets.top + Spacing.sm,
        },
      ]}
    >
      <View style={styles.row}>
        {/* ---------------- GAUCHE : logo + nom ---------------- */}
        <View style={styles.left}>
          <View
            style={[
              styles.logoWrapper,
              {
                borderColor: colors.border,
                backgroundColor: colors.surfaceAlt,
              },
            ]}
          >
            <Image
              source={require('@/assets/images/my-logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.brand, { color: colors.text }]}
              numberOfLines={1}
            >
              {APP_NAME}
            </Text>
            <Text
              style={[styles.subtitle, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {APP_SUBTITLE}
            </Text>
          </View>
        </View>

        {/* ---------------- DROITE : actions ---------------- */}
        <View style={styles.actions}>
          <IconButton
            onPress={onThemePress}
            icon={<Palette size={20} color={colors.text} strokeWidth={2.2} />}
          />
          <IconButton
            onPress={onNotificationsPress}
            badge={unreadCount}
            icon={<Bell size={20} color={colors.text} strokeWidth={2.2} />}
          />

          {/* Avatar utilisateur + dropdown */}
          <View style={{ position: 'relative' }}>
            <Pressable
              onPress={() => setUserMenuOpen((v) => !v)}
              hitSlop={8}
              style={({ pressed }) => [
                styles.avatarBtn,
                {
                  backgroundColor: pressed
                    ? colors.surfaceAlt
                    : colors.primary + '18',
                  borderColor: colors.primary + '55',
                },
              ]}
            >
              {user?.fullName ? (
                <Text
                  style={[styles.avatarText, { color: colors.primary }]}
                  numberOfLines={1}
                >
                  {initialsFromFullName(user.fullName)}
                </Text>
              ) : (
                <UserIcon size={18} color={colors.primary} strokeWidth={2.4} />
              )}
            </Pressable>

            {/* Dropdown */}
            <UserMenu
              open={userMenuOpen}
              onClose={() => setUserMenuOpen(false)}
              displayName={displayName}
              code={user?.code ?? null}
              onLogout={async () => {
                setUserMenuOpen(false);
                await logout();
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

// ------------------------------------------------------------------
// Menu utilisateur (dropdown)
// ------------------------------------------------------------------
function UserMenu({
  open,
  onClose,
  displayName,
  code,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  displayName: string;
  code: string | null;
  onLogout: () => void;
}) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const translateY = useRef(new Animated.Value(-8)).current;

  React.useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 7,
          tension: 120,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 140,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.94,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -8,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open, opacity, scale, translateY]);

  return (
    <>
      {/* Backdrop cliquable (invisible, capte les taps) */}
      {open && (
        <Pressable
          onPress={onClose}
          style={[styles.menuBackdrop, { zIndex: 90 }]}
        />
      )}

      {/* Carte du menu */}
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[
          styles.menuCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity,
            transform: [{ translateY }, { scale }],
            zIndex: 100,
          },
        ]}
      >
        {/* Header : nom complet */}
        <View style={styles.menuHeader}>
          <View
            style={[
              styles.menuAvatar,
              {
                backgroundColor: colors.primary + '22',
                borderColor: colors.primary + '55',
              },
            ]}
          >
            <Text style={[styles.menuAvatarText, { color: colors.primary }]}>
              {initialsFromFullName(displayName)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.menuName, { color: colors.text }]}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {code && (
              <Text
                style={[styles.menuCode, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                Code : {code}
              </Text>
            )}
          </View>
        </View>

        {/* Séparateur */}
        <View
          style={[styles.menuDivider, { backgroundColor: colors.border }]}
        />

        {/* Bouton déconnexion */}
        <Pressable
          onPress={onLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            {
              backgroundColor: pressed ? colors.danger + '18' : 'transparent',
            },
          ]}
        >
          <LogOut size={16} color={colors.danger} strokeWidth={2.4} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>
            Se déconnecter
          </Text>
        </Pressable>
      </Animated.View>
    </>
  );
}

// ------------------------------------------------------------------
// Bouton icône
// ------------------------------------------------------------------
function IconButton({
  icon,
  onPress,
  badge = 0,
}: {
  icon: React.ReactNode;
  onPress: () => void;
  badge?: number;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconBtn,
        {
          backgroundColor: pressed ? colors.surfaceAlt : 'transparent',
          borderColor: colors.border,
        },
      ]}
    >
      {icon}
      {badge > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.danger }]}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoWrapper: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 48, height: 48 },
  brand: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: FontSize.xs,
    marginTop: 1,
    letterSpacing: 0.3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
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
    borderColor: '#000',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },

  // ---------------- Avatar utilisateur ----------------
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // ---------------- Menu utilisateur ----------------
  menuBackdrop: {
    position: 'absolute',
    top: -2000,
    left: -2000,
    right: -2000,
    bottom: -2000,
  },
  menuCard: {
    position: 'absolute',
    top: 46,
    right: 0,
    minWidth: 240,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 14,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  menuAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuAvatarText: {
    fontSize: 14,
    fontWeight: '900',
  },
  menuName: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  menuCode: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.sm,
  },
  logoutText: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
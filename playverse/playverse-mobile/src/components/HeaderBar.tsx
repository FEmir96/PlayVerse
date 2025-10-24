// playverse/playverse-mobile/src/components/HeaderBar.tsx
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing, typography } from '../styles/theme';
import { PV_LOGO_H28 } from '../lib/asset';

type Props = {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  showBell?: boolean;
  onBellPress?: () => void;
};

export default function HeaderBar({
  title = '',
  showBack = false,
  onBackPress,
  showBell = true,
  onBellPress,
}: Props) {
  const nav = useNavigation();
  const goBack = () => {
    if (onBackPress) return onBackPress();
    // @ts-ignore
    if (nav.canGoBack?.()) nav.goBack();
    else {
      // @ts-ignore
      nav.navigate('Tabs', { screen: 'Home' });
    }
  };
  const openNotifications = () => {
    if (onBellPress) return onBellPress();
    // @ts-ignore
    nav.navigate('Notifications');
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable onPress={goBack} style={styles.iconBtn} accessibilityRole="button">
            <Ionicons name="arrow-back" size={18} color={colors.accent} />
          </Pressable>
        ) : (
          <View style={styles.iconBtnPlaceholder} />
        )}

        <View style={styles.centerBlock}>
          <Image source={PV_LOGO_H28} style={styles.logo} resizeMode="contain" />
          {!!title && <Text style={styles.title}>{title}</Text>}
        </View>

        {showBell ? (
          <Pressable onPress={openNotifications} style={styles.iconBtn} accessibilityRole="button">
            <Ionicons name="notifications-outline" size={18} color={colors.accent} />
          </Pressable>
        ) : (
          <View style={styles.iconBtnPlaceholder} />
        )}
      </View>

      <View style={styles.bottomLine} />
    </View>
  );
}

const BG = '#0D3441';
const LINE = '#114A59';

const styles = StyleSheet.create({
  container: {
    backgroundColor: BG,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  logo: { width: 32, height: 18, alignSelf: 'center' },
  title: {
    color: colors.accent,
    fontSize: typography.h2,
    fontWeight: '800',
    textTransform: 'capitalize',
    letterSpacing: 0.4,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: LINE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E3A49',
  },
  iconBtnPlaceholder: { width: 34, height: 34 },
  bottomLine: {
    height: 2,
    marginTop: spacing.sm,
    borderRadius: 2,
    backgroundColor: LINE,
    shadowColor: colors.accent,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});

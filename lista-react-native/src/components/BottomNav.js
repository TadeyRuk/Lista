import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts } from '../theme';
import SunMark from './SunMark';

// Custom bottom navigation matching the prototype: Bahay · Lista · (Scan FAB) · Suki · Ako.
export default function BottomNav({ navigation }) {
  return (
    <View style={styles.nav}>
      <Item label="Bahay" active>
        <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
      </Item>

      <Pressable style={styles.item} onPress={() => navigation.navigate('TabViewer')}>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.mutedSoft} strokeWidth={2.1} strokeLinecap="round">
          <Path d="M4 6h16M4 12h16M4 18h10" />
        </Svg>
        <Text style={styles.label}>Lista</Text>
      </Pressable>

      <Pressable style={styles.fab} onPress={() => navigation.navigate('Scanner')}>
        <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={colors.navy} strokeWidth={2.2} strokeLinecap="round">
          <Path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
          <Path d="M3 12h18" />
        </Svg>
      </Pressable>

      <Item label="Suki">
        <Path d="M9 8a3.2 3.2 0 1 0 0 0.01M3 20a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M21 20a5 5 0 0 0-4-4.9" />
      </Item>
      <Item label="Ako">
        <Path d="M12 8a3.4 3.4 0 1 0 0 0.01M5 21a7 7 0 0 1 14 0" />
      </Item>
    </View>
  );
}

function Item({ label, active, children }) {
  const c = active ? colors.navy : colors.mutedSoft;
  return (
    <View style={styles.item}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </Svg>
      <Text style={[styles.label, { color: c, fontFamily: active ? fonts.bold : fonts.semibold }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 11,
    paddingHorizontal: 16,
  },
  item: { alignItems: 'center', gap: 3 },
  label: { fontSize: 10, fontFamily: fonts.semibold, color: colors.mutedSoft },
  fab: {
    marginTop: -26,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts } from '../theme';

// Small shield-check glyph used for "verified on-chain" trust cues.
export function ShieldIcon({ size = 14, color = colors.bayad }) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24">
      <Path
        d="M12 2l7 3v6c0 4.5-3 8.2-7 9-4-0.8-7-4.5-7-9V5l7-3z"
        fill={color}
        opacity={0.16}
      />
      <Path
        d="M12 2l7 3v6c0 4.5-3 8.2-7 9-4-0.8-7-4.5-7-9V5l7-3z"
        fill="none"
        stroke={color}
        strokeWidth={1.6}
      />
      <Path
        d="M8.7 12l2.1 2.1 4-4.3"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Inline "verified on-chain" badge.
export function VerifiedBadge({ label = 'verified on-chain', color = colors.bayad }) {
  return (
    <View style={styles.row}>
      <ShieldIcon size={12} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  label: { fontFamily: fonts.semibold, fontSize: 11 },
});
